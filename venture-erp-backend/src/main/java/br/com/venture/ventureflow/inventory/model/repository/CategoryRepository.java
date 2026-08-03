package br.com.venture.ventureflow.inventory.model.repository;

import br.com.venture.ventureflow.inventory.model.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCaseAndIdNot(String code, Long id);

    List<Category> findAllByActiveTrueOrderByNameAsc();

    List<Category> findAllByActiveFalseOrderByNameAsc();

    List<Category> findAllByIdInAndActiveTrue(Collection<Long> ids);
}
