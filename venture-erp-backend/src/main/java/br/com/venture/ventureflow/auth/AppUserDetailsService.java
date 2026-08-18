package br.com.venture.ventureflow.auth;

import br.com.venture.ventureflow.user.model.repository.UserRepository;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

/**
 * Loads accounts for authentication.
 *
 * <p>Only active users resolve, so deactivating a user immediately blocks new
 * logins. Existing tokens survive until expiry.
 */
@Service
public class AppUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public AppUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository
                .findByEmailAndActiveTrue(email.trim().toLowerCase(Locale.ROOT))
                .map(AppUserDetails::new)
                .orElseThrow(() -> new UsernameNotFoundException("Invalid credentials."));
    }
}
