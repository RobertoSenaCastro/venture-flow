package br.com.venture.ventureflow.inventory.model.repository;

import br.com.venture.ventureflow.inventory.model.entity.ItemAlias;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ItemAliasRepository extends JpaRepository<ItemAlias, Long> {

    Optional<ItemAlias> findBySourceIgnoreCaseAndCodeIgnoreCase(String source, String code);

    /** May return several rows: the same code can exist under different sources. */
    List<ItemAlias> findAllByCodeIgnoreCase(String code);

    boolean existsBySourceIgnoreCaseAndCodeIgnoreCase(String source, String code);

    boolean existsBySourceIgnoreCaseAndCodeIgnoreCaseAndItem_IdNot(String source, String code, Long itemId);
}
