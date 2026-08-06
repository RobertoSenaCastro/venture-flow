package br.com.venture.ventureflow.user.model.repository;

import br.com.venture.ventureflow.user.model.entity.User;
import br.com.venture.ventureflow.user.model.entity.UserRole;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    Optional<User> findByEmailAndActiveTrue(String email);

    List<User> findByActiveFalse(Sort sort);

    /**
     * Optional filters applied in SQL rather than in memory.
     *
     * <p>Filtering after loading every row is the failure mode this method
     * exists to prevent: it works until the table grows or a caller forgets.
     */
    @Query("""
            SELECT u FROM User u
            WHERE u.active = true
              AND (:role IS NULL OR u.role = :role)
              AND (:resellerId IS NULL OR u.reseller.id = :resellerId)
            """)
    List<User> search(@Param("role") UserRole role, @Param("resellerId") Long resellerId, Sort sort);

    /** Feeds the supervisor dropdown on the sales-order form. */
    List<User> findByRoleAndResellerIdAndActiveTrue(UserRole role, Long resellerId, Sort sort);
}
