package br.com.venture.ventureflow.salesorder.model.repository;

import br.com.venture.ventureflow.salesorder.model.entity.SalesOrder;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

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
    
    /**
     * Finds orders currently in the trash.
     *
     * @param sort ordering to apply
     * @return inactive orders in the requested order
     */
    List<SalesOrder> findByActiveFalse(Sort sort);
}
