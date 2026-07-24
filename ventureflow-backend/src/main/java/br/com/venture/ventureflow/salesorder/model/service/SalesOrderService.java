package br.com.venture.ventureflow.salesorder.model.service;

import br.com.venture.ventureflow.salesorder.model.dto.SalesOrderRequest;
import br.com.venture.ventureflow.salesorder.model.dto.SalesOrderResponse;
import br.com.venture.ventureflow.salesorder.model.entity.SalesOrder;
import br.com.venture.ventureflow.salesorder.model.repository.SalesOrderRepository;
import jakarta.persistence.EntityNotFoundException;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
public class SalesOrderService {

    private final SalesOrderRepository salesOrderRepository;

    public SalesOrderService(SalesOrderRepository salesOrderRepository) {
        this.salesOrderRepository = salesOrderRepository;
    }

    public SalesOrderResponse create(SalesOrderRequest request) {
        String code = generateNextCode();

        SalesOrder salesOrder = new SalesOrder(
                code,
                request.name(),
                request.description(),
                request.status(),
                LocalDateTime.now()
        );

        SalesOrder savedSalesOrder = salesOrderRepository.save(salesOrder);
        return SalesOrderResponse.from(savedSalesOrder);
    }

    public List<SalesOrderResponse> findAll() {
    	Sort sort = Sort.by(
			Sort.Direction.DESC,
			"createdAt"
		).and(
			Sort.by(
				Sort.Direction.DESC,
				"id"
			)
		);   			
    			
        return salesOrderRepository.findByActiveTrue(sort)
	        .stream()
	        .map(SalesOrderResponse::from)
	        .toList();
    }

    public SalesOrderResponse findById(Long id) {
        SalesOrder salesOrder = findEntityById(id);
        return SalesOrderResponse.from(salesOrder);
    }

    public SalesOrderResponse update(Long id, SalesOrderRequest request) {
        SalesOrder salesOrder = findEntityById(id);

        salesOrder.setName(request.name());
        salesOrder.setDescription(request.description());
        salesOrder.setStatus(request.status());

        SalesOrder updatedSalesOrder = salesOrderRepository.save(salesOrder);
        return SalesOrderResponse.from(updatedSalesOrder);
    }

    public void softDelete(Long id) {
        SalesOrder salesOrder = findEntityById(id);
        salesOrder.setActive(false);
        salesOrderRepository.save(salesOrder);
    }

    public void activate(Long id) {
        SalesOrder salesOrder = findEntityById(id);
        salesOrder.setActive(true);
        salesOrderRepository.save(salesOrder);
    }

    private SalesOrder findEntityById(Long id) {
        return salesOrderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Sales order not found with ID: " + id
                ));
    }

    private String generateNextCode() {
        long nextNumber = salesOrderRepository.count() + 1;
        return "PV-%02d".formatted(nextNumber);
    }
    
    @Transactional
    public void softDeleteMany(Set<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new IllegalArgumentException(
                    "At least one sales order ID is required."
            );
        }

        List<SalesOrder> salesOrders =
                salesOrderRepository.findAllById(ids);

        if (salesOrders.size() != ids.size()) {
            throw new EntityNotFoundException(
                    "One or more sales orders were not found."
            );
        }

        salesOrders.forEach(
                salesOrder -> salesOrder.setActive(false)
        );
    }
    
    public List<SalesOrderResponse> findAllSoftDeleted() {
        Sort sort = Sort.by(
            Sort.Direction.DESC,
            "createdAt"
        ).and(
            Sort.by(
                Sort.Direction.DESC,
                "id"
            )
        );

        return salesOrderRepository
            .findByActiveFalse(sort)
            .stream()
            .map(SalesOrderResponse::from)
            .toList();
    }
}
