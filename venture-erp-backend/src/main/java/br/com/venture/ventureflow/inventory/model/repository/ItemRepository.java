package br.com.venture.ventureflow.inventory.model.repository;

import br.com.venture.ventureflow.inventory.model.entity.Item;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ItemRepository extends JpaRepository<Item, Long> {

    @EntityGraph(attributePaths = {"categories", "aliases"})
    List<Item> findAllByActiveTrue(Sort sort);

    @EntityGraph(attributePaths = {"categories", "aliases"})
    List<Item> findAllByActiveFalse(Sort sort);

    @EntityGraph(attributePaths = {"categories", "aliases"})
    Optional<Item> findWithRelationsById(Long id);

    @EntityGraph(attributePaths = {"categories", "aliases"})
    Optional<Item> findByCodeIgnoreCase(String code);

    /** Items holding at least one of the given categories; used by future catalog filters. */
    @EntityGraph(attributePaths = {"categories", "aliases"})
    List<Item> findDistinctByActiveTrueAndCategories_IdIn(List<Long> categoryIds, Sort sort);

    boolean existsByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCaseAndIdNot(String code, Long id);

    boolean existsByCategories_Id(Long categoryId);
}
