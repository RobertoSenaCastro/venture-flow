package br.com.venture.ventureflow.salesorder.model.service;

import br.com.venture.ventureflow.auth.AppUserDetails;
import br.com.venture.ventureflow.reseller.model.entity.Reseller;
import br.com.venture.ventureflow.reseller.model.repository.ResellerRepository;
import br.com.venture.ventureflow.salesorder.model.dto.SalesOrderRequest;
import br.com.venture.ventureflow.salesorder.model.dto.SalesOrderResponse;
import br.com.venture.ventureflow.salesorder.model.entity.SalesOrder;
import br.com.venture.ventureflow.salesorder.model.repository.SalesOrderRepository;
import br.com.venture.ventureflow.user.exception.InvalidRoleAssignmentException;
import br.com.venture.ventureflow.user.model.entity.User;
import br.com.venture.ventureflow.user.model.entity.UserRole;
import br.com.venture.ventureflow.user.model.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;

import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

/**
 * Coordinates sales-order business rules, persistence, and DTO mapping.
 *
 * <p>Creation and update require an active reseller. List operations separate
 * active orders from the trash, while deletion preserves rows by toggling the
 * entity's active flag.</p>
 */
@Service
public class SalesOrderService {
	private static final Sort NEWEST_FIRST = Sort.by(Sort.Direction.DESC, "createdAt")
			.and(Sort.by(Sort.Direction.DESC, "id"));

	private final SalesOrderRepository salesOrderRepository;
	private final ResellerRepository resellerRepository;
	private final UserRepository userRepository;

	public SalesOrderService(
			SalesOrderRepository salesOrderRepository,
			ResellerRepository resellerRepository,
			UserRepository userRepository
	) {

		this.salesOrderRepository = salesOrderRepository;
		this.resellerRepository = resellerRepository;
		this.userRepository = userRepository;
	}

	/**
	 * Creates an active order with a generated code and creation timestamp.
	 *
	 * @param request validated order data
	 * @return the persisted order as an API response
	 * @throws IllegalArgumentException if the reseller does not exist or is inactive
	 */
	public SalesOrderResponse create(SalesOrderRequest request, AppUserDetails principal) {
		requireWriteAccess(principal);
		String code = generateNextCode();

		Reseller reseller = resellerRepository.findByIdAndActiveTrue(request.resellerId())
				.orElseThrow(() -> new IllegalArgumentException("Active reseller not found."));

		SalesOrder salesOrder = new SalesOrder(code, request.name(), request.description(), reseller, request.status(),
				LocalDateTime.now());

		salesOrder.setAssemblySupervisor(
				resolveAssemblySupervisor(request.assemblySupervisorId(), reseller));

		SalesOrder savedSalesOrder = salesOrderRepository.save(salesOrder);
		return SalesOrderResponse.from(savedSalesOrder);
	}

	/**
	 * Returns active orders newest first, using the identifier as a stable
	 * secondary ordering when timestamps are equal.
	 *
	 * @return active order responses
	 */
	public List<SalesOrderResponse> findAll(AppUserDetails principal) {
		List<SalesOrder> salesOrders = switch (principal.getRole()) {
			case ADMIN -> salesOrderRepository.findByActiveTrue(NEWEST_FIRST);
			case RESELLER_ADMIN -> salesOrderRepository.findByActiveTrueAndResellerId(
					requireResellerId(principal), NEWEST_FIRST);
			case ASSEMBLY_SUPERVISOR -> salesOrderRepository
					.findByActiveTrueAndAssemblySupervisorId(principal.getUserId(), NEWEST_FIRST);
		};

		return salesOrders.stream().map(SalesOrderResponse::from).toList();
	}

	/**
	 * Finds an order by identifier without filtering on its active flag.
	 *
	 * @param id persisted order identifier
	 * @return matching order response
	 * @throws EntityNotFoundException if no order has the identifier
	 */
	public SalesOrderResponse findById(Long id, AppUserDetails principal) {
		SalesOrder salesOrder = findVisibleEntityById(id, principal);
		return SalesOrderResponse.from(salesOrder);
	}

	/**
	 * Updates editable order fields while preserving code, creation time, and
	 * active state.
	 *
	 * @param id persisted order identifier
	 * @param request replacement values and required reseller identifier
	 * @return updated order response
	 * @throws EntityNotFoundException if the order does not exist
	 * @throws IllegalArgumentException if the reseller does not exist or is inactive
	 */
	public SalesOrderResponse update(
		    Long id,
		    SalesOrderRequest request,
		    AppUserDetails principal
		) {
		    requireWriteAccess(principal);
		    SalesOrder salesOrder = findVisibleEntityById(id, principal);

		    Reseller reseller = resellerRepository
		        .findByIdAndActiveTrue(request.resellerId())
		        .orElseThrow(
		            () -> new IllegalArgumentException(
		                "Active reseller not found."
		            )
		        );

		    User assemblySupervisor = salesOrder.getAssemblySupervisor();

		    if (assemblySupervisor != null
		            && (assemblySupervisor.getReseller() == null
		                || !assemblySupervisor.getReseller().getId().equals(reseller.getId()))) {
		        assemblySupervisor = null;
		    }

		    assemblySupervisor = resolveAssemblySupervisor(
		            request.assemblySupervisorId(), reseller);

		    salesOrder.setName(request.name());
		    salesOrder.setDescription(request.description());
		    salesOrder.setStatus(request.status());
		    salesOrder.setReseller(reseller);
		    salesOrder.setAssemblySupervisor(assemblySupervisor);

		    SalesOrder updatedSalesOrder =
		        salesOrderRepository.save(salesOrder);

		    return SalesOrderResponse.from(updatedSalesOrder);
		}

	/**
	 * Moves an order to the trash without deleting its database row.
	 *
	 * @param id persisted order identifier
	 * @throws EntityNotFoundException if the order does not exist
	 */
	public void softDelete(Long id, AppUserDetails principal) {
		requireWriteAccess(principal);
		SalesOrder salesOrder = findVisibleEntityById(id, principal);
		salesOrder.setActive(false);
		salesOrderRepository.save(salesOrder);
	}

	/**
	 * Restores an order by setting its active flag to true.
	 *
	 * @param id persisted order identifier
	 * @throws EntityNotFoundException if the order does not exist
	 */
	public void activate(Long id, AppUserDetails principal) {
		requireWriteAccess(principal);
		SalesOrder salesOrder = findVisibleEntityById(id, principal);
		salesOrder.setActive(true);
		salesOrderRepository.save(salesOrder);
	}

	private SalesOrder findVisibleEntityById(Long id, AppUserDetails principal) {
		return (switch (principal.getRole()) {
			case ADMIN -> salesOrderRepository.findById(id);
			case RESELLER_ADMIN -> salesOrderRepository.findByIdAndResellerId(
					id, requireResellerId(principal));
			case ASSEMBLY_SUPERVISOR -> salesOrderRepository
					.findByIdAndAssemblySupervisorId(id, principal.getUserId());
		})
				.orElseThrow(() -> new EntityNotFoundException("Sales order not found with ID: " + id));
	}

	/**
	 * Generates the next display code from the current total row count.
	 *
	 * <p>The method reflects the existing implementation exactly: it does not
	 * reserve a sequence value or provide concurrency protection.</p>
	 *
	 * @return code in the {@code PV-%02d} format
	 */
	private String generateNextCode() {
		long nextNumber = salesOrderRepository.count() + 1;
		return "PV-%02d".formatted(nextNumber);
	}

	/**
	 * Soft-deletes a set of orders atomically.
	 *
	 * <p>All identifiers are resolved before flags are changed. Because the
	 * entities remain managed inside the transaction, JPA dirty checking writes
	 * the flag changes when the transaction completes.</p>
	 *
	 * @param ids unique order identifiers to soft-delete
	 * @throws IllegalArgumentException if the set is null or empty
	 * @throws EntityNotFoundException if any requested identifier is missing
	 */
	@Transactional
	public void softDeleteMany(Set<Long> ids, AppUserDetails principal) {
		requireWriteAccess(principal);

		if (ids == null || ids.isEmpty()) {
			throw new IllegalArgumentException("At least one sales order ID is required.");
		}

		List<SalesOrder> salesOrders = salesOrderRepository.findAllById(ids);

		if (salesOrders.size() != ids.size()) {
			throw new EntityNotFoundException("One or more sales orders were not found.");
		}

		salesOrders.forEach(salesOrder -> salesOrder.setActive(false));
	}

	/**
	 * Returns soft-deleted orders using the same newest-first ordering as the
	 * active list.
	 *
	 * @return order responses currently in the trash
	 */
	public List<SalesOrderResponse> findAllSoftDeleted(AppUserDetails principal) {
		List<SalesOrder> salesOrders = switch (principal.getRole()) {
			case ADMIN -> salesOrderRepository.findByActiveFalse(NEWEST_FIRST);
			case RESELLER_ADMIN -> salesOrderRepository.findByActiveFalseAndResellerId(
					requireResellerId(principal), NEWEST_FIRST);
			case ASSEMBLY_SUPERVISOR -> salesOrderRepository
					.findByActiveFalseAndAssemblySupervisorId(principal.getUserId(), NEWEST_FIRST);
		};

		return salesOrders.stream().map(SalesOrderResponse::from).toList();
	}

	private void requireWriteAccess(AppUserDetails principal) {
		if (principal.getRole() != UserRole.ADMIN) {
			throw new AccessDeniedException("Only administrators may modify sales orders.");
		}
	}

	private Long requireResellerId(AppUserDetails principal) {
		if (principal.getResellerId() == null) {
			throw new AccessDeniedException("The authenticated user is not linked to a reseller.");
		}

		return principal.getResellerId();
	}

	private User resolveAssemblySupervisor(Long supervisorId, Reseller reseller) {
		if (supervisorId == null) {
			return null;
		}

		return userRepository.findByIdAndActiveTrueAndRoleAndResellerId(
				supervisorId,
				UserRole.ASSEMBLY_SUPERVISOR,
				reseller.getId()
		).orElseThrow(() -> new InvalidRoleAssignmentException(
				"The assembly supervisor must be active and belong to the sales order reseller."));
	}
}
