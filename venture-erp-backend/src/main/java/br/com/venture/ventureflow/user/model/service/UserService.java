package br.com.venture.ventureflow.user.model.service;

import br.com.venture.ventureflow.reseller.model.entity.Reseller;
import br.com.venture.ventureflow.reseller.model.repository.ResellerRepository;
import br.com.venture.ventureflow.user.exception.EmailAlreadyUsedException;
import br.com.venture.ventureflow.user.exception.InvalidRoleAssignmentException;
import br.com.venture.ventureflow.user.exception.ResellerNotAvailableException;
import br.com.venture.ventureflow.user.exception.UserNotFoundException;
import br.com.venture.ventureflow.user.model.dto.PasswordChangeRequest;
import br.com.venture.ventureflow.user.model.dto.UserCreationRequest;
import br.com.venture.ventureflow.user.model.dto.UserOptionResponse;
import br.com.venture.ventureflow.user.model.dto.UserRequest;
import br.com.venture.ventureflow.user.model.dto.UserResponse;
import br.com.venture.ventureflow.user.model.entity.User;
import br.com.venture.ventureflow.user.model.entity.UserRole;
import br.com.venture.ventureflow.user.model.repository.UserRepository;

import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

/**
 * Account lifecycle, role invariants, and credential handling.
 *
 * <p>Two rules are enforced here rather than in the database, because both are
 * conditional on {@code role} and a column constraint cannot express them:
 * reseller administrators and assembly supervisors must belong to an active
 * reseller, and a factory administrator must not belong to one.
 */
@Service
public class UserService {

    private static final Sort BY_NAME = Sort.by(Sort.Direction.ASC, "name");

    private final UserRepository userRepository;
    private final ResellerRepository resellerRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            ResellerRepository resellerRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.resellerRepository = resellerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse create(UserCreationRequest request) {
        UserRequest data = request.user();
        String email = normalizeEmail(data.email());

        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyUsedException(email);
        }

        Reseller reseller = resolveReseller(data.role(), data.resellerId());

        User user = new User(
                data.name().trim(),
                email,
                passwordEncoder.encode(request.password()),
                data.role(),
                reseller
        );

        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserResponse update(Long id, UserRequest request) {
        User user = load(id);
        String email = normalizeEmail(request.email());

        if (userRepository.existsByEmailAndIdNot(email, id)) {
            throw new EmailAlreadyUsedException(email);
        }

        user.setName(request.name().trim());
        user.setEmail(email);
        user.setRole(request.role());
        user.setReseller(resolveReseller(request.role(), request.resellerId()));

        return UserResponse.from(user);
    }

    /**
     * Replaces the stored credential.
     *
     * <p>Verification of a current password is intentionally absent: no
     * authenticated session exists yet, so there is nothing to verify against.
     * Once login lands, this method gains that check.
     */
    @Transactional
    public void changePassword(Long id, PasswordChangeRequest request) {
        load(id).setPasswordHash(passwordEncoder.encode(request.password()));
    }

    @Transactional(readOnly = true)
    public List<UserResponse> search(UserRole role, Long resellerId) {
        return userRepository.search(role, resellerId, BY_NAME).stream()
                .map(UserResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserResponse> findInactive() {
        return userRepository.findByActiveFalse(BY_NAME).stream()
                .map(UserResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse findById(Long id) {
        return UserResponse.from(load(id));
    }

    /**
     * Active supervisors of one reseller, for the sales-order assignment field.
     *
     * <p>Scoping by reseller here is what keeps the sales-order form from
     * offering a supervisor who belongs to a different company.
     */
    @Transactional(readOnly = true)
    public List<UserOptionResponse> findSupervisorOptions(Long resellerId) {
        return userRepository
                .findByRoleAndResellerIdAndActiveTrue(UserRole.ASSEMBLY_SUPERVISOR, resellerId, BY_NAME)
                .stream()
                .map(UserOptionResponse::from)
                .toList();
    }

    @Transactional
    public void deactivate(Long id) {
        load(id).setActive(false);
    }

    @Transactional
    public void activate(Long id) {
        load(id).setActive(true);
    }

    private User load(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new UserNotFoundException(id));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    /**
     * Applies the conditional reseller rule and returns the association to set.
     */
    private Reseller resolveReseller(UserRole role, Long resellerId) {
        if (role == UserRole.RESELLER_ADMIN
                || role == UserRole.ASSEMBLY_SUPERVISOR) {
            if (resellerId == null) {
                throw new InvalidRoleAssignmentException(
                        "A reseller administrator or assembly supervisor must be linked to a reseller.");
            }

            return resellerRepository.findByIdAndActiveTrue(resellerId)
                    .orElseThrow(() -> new ResellerNotAvailableException(resellerId));
        }

        if (resellerId != null) {
            throw new InvalidRoleAssignmentException(
                    "A factory administrator must not be linked to a reseller.");
        }

        return null;
    }
}
