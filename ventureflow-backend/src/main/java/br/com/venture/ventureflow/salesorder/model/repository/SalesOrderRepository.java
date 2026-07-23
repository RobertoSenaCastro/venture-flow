package br.com.venture.ventureflow.salesorder.model.repository;

import br.com.venture.ventureflow.salesorder.model.entity.SalesOrder;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SalesOrderRepository extends JpaRepository<SalesOrder, Long> {

    List<SalesOrder> findByActiveTrue(Sort sort);
}
