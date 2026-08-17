package br.com.venture.ventureflow.salesorder.model.repository;

import br.com.venture.ventureflow.salesorder.model.entity.SalesOrder;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data persistence boundary for sales orders.
 *
 * <p>Active and soft-deleted rows are queried separately; callers provide the
 * ordering so both lists can share the same newest-first sort.</p>
 */
public interface SalesOrderRepository extends JpaRepository<SalesOrder, Long> {

    /**
     * Finds orders visible in the normal list.
     *
     * @param sort ordering to apply
     * @return active orders in the requested order
     */
    List<SalesOrder> findByActiveTrue(Sort sort);

    List<SalesOrder> findByActiveTrueAndResellerId(Long resellerId, Sort sort);

    List<SalesOrder> findByActiveTrueAndAssemblySupervisorId(Long userId, Sort sort);
    
    /**
     * Finds orders currently in the trash.
     *
     * @param sort ordering to apply
     * @return inactive orders in the requested order
     */
    List<SalesOrder> findByActiveFalse(Sort sort);

    List<SalesOrder> findByActiveFalseAndResellerId(Long resellerId, Sort sort);

    List<SalesOrder> findByActiveFalseAndAssemblySupervisorId(Long userId, Sort sort);

    Optional<SalesOrder> findByIdAndResellerId(Long id, Long resellerId);

    Optional<SalesOrder> findByIdAndAssemblySupervisorId(Long id, Long userId);
}
