package br.com.venture.ventureflow.auth;

import br.com.venture.ventureflow.auth.dto.LoginRequest;
import br.com.venture.ventureflow.auth.dto.LoginResponse;
import br.com.venture.ventureflow.user.model.entity.User;
import br.com.venture.ventureflow.user.model.repository.UserRepository;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.Locale;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public AuthController(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UserRepository userRepository
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    /**
     * Exchanges credentials for a token.
     *
     * <p>Both a wrong password and an unknown email return the same 401 with no
     * detail. Distinguishing them would let a caller confirm which emails are
     * registered.
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.password()));
        } catch (AuthenticationException exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userRepository.findByEmailAndActiveTrue(email).orElseThrow();

        return ResponseEntity.ok(new LoginResponse(
                jwtService.issue(email),
                jwtService.getLifetimeSeconds(),
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getReseller() == null ? null : user.getReseller().getId()
        ));
    }

    /** Lets the frontend confirm a stored token is still usable on reload. */
    @GetMapping("/me")
    public ResponseEntity<LoginResponse> me(@AuthenticationPrincipal AppUserDetails principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userRepository.findById(principal.getUserId()).orElseThrow();

        return ResponseEntity.ok(new LoginResponse(
                null,
                jwtService.getLifetimeSeconds(),
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getReseller() == null ? null : user.getReseller().getId()
        ));
    }
}
