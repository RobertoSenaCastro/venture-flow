package br.com.venture.ventureflow.inventory.model.service;

import br.com.venture.ventureflow.inventory.exception.AmbiguousCodeException;
import br.com.venture.ventureflow.inventory.exception.CategoryNotFoundException;
import br.com.venture.ventureflow.inventory.exception.DuplicateCodeException;
import br.com.venture.ventureflow.inventory.exception.ItemNotFoundException;
import br.com.venture.ventureflow.inventory.model.dto.ItemAliasRequest;
import br.com.venture.ventureflow.inventory.model.dto.ItemRequest;
import br.com.venture.ventureflow.inventory.model.dto.ItemResponse;
import br.com.venture.ventureflow.inventory.model.dto.QuantityAdjustmentRequest;
import br.com.venture.ventureflow.inventory.model.entity.Category;
import br.com.venture.ventureflow.inventory.model.entity.Item;
import br.com.venture.ventureflow.inventory.model.entity.ItemAlias;
import br.com.venture.ventureflow.inventory.model.repository.CategoryRepository;
import br.com.venture.ventureflow.inventory.model.repository.ItemAliasRepository;
import br.com.venture.ventureflow.inventory.model.repository.ItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ItemService {

    private static final Logger log = LoggerFactory.getLogger(ItemService.class);

    private static final Sort DEFAULT_SORT = Sort.by(Sort.Direction.ASC, "name").and(Sort.by("id"));

    private final ItemRepository itemRepository;
    private final CategoryRepository categoryRepository;
    private final ItemAliasRepository itemAliasRepository;

    public ItemService(ItemRepository itemRepository,
                       CategoryRepository categoryRepository,
                       ItemAliasRepository itemAliasRepository) {
        this.itemRepository = itemRepository;
        this.categoryRepository = categoryRepository;
        this.itemAliasRepository = itemAliasRepository;
    }

    @Transactional
    public ItemResponse create(ItemRequest request) {
        String code = normalizeCode(request.code());
        if (itemRepository.existsByCodeIgnoreCase(code)) {
            throw new DuplicateCodeException("Item code already in use: " + code);
        }

        Item item = new Item(
                code,
                request.name().trim(),
                normalizeDescription(request.description()),
                request.unit()
        );
        item.replaceCategories(loadActiveCategories(request.categoryIds()));
        syncAliases(item, request.aliases());

        return ItemResponse.from(itemRepository.save(item));
    }

    @Transactional
    public ItemResponse update(Long id, ItemRequest request) {
        Item item = load(id);

        String code = normalizeCode(request.code());
        if (itemRepository.existsByCodeIgnoreCaseAndIdNot(code, id)) {
            throw new DuplicateCodeException("Item code already in use: " + code);
        }

        item.setCode(code);
        item.setName(request.name().trim());
        item.setDescription(normalizeDescription(request.description()));
        item.setUnit(request.unit());
        item.replaceCategories(loadActiveCategories(request.categoryIds()));
        syncAliases(item, request.aliases());

        return ItemResponse.from(item);
    }

    @Transactional(readOnly = true)
    public List<ItemResponse> findAllActive() {
        return itemRepository.findAllByActiveTrue(DEFAULT_SORT).stream()
                .map(ItemResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ItemResponse> findAllInactive() {
        return itemRepository.findAllByActiveFalse(DEFAULT_SORT).stream()
                .map(ItemResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ItemResponse> findActiveByCategories(List<Long> categoryIds) {
        if (categoryIds == null || categoryIds.isEmpty()) {
            return findAllActive();
        }
        return itemRepository.findDistinctByActiveTrueAndCategories_IdIn(categoryIds, DEFAULT_SORT).stream()
                .map(ItemResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ItemResponse findById(Long id) {
        return ItemResponse.from(load(id));
    }

    /**
     * Resolves an internal code or an alias to a single item. Used by imports.
     *
     * @param source optional. When absent and the code matches aliases of more than one
     *               item, the caller must retry informing the source.
     */
    @Transactional(readOnly = true)
    public ItemResponse findByAnyCode(String code, String source) {
        String normalizedCode = normalizeCode(code);

        Optional<Item> byInternalCode = itemRepository.findByCodeIgnoreCase(normalizedCode);
        if (byInternalCode.isPresent()) {
            return ItemResponse.from(byInternalCode.get());
        }

        if (source != null && !source.isBlank()) {
            return itemAliasRepository
                    .findBySourceIgnoreCaseAndCodeIgnoreCase(normalizeSource(source), normalizedCode)
                    .map(alias -> ItemResponse.from(load(alias.getItem().getId())))
                    .orElseThrow(() -> new ItemNotFoundException("No item found for code: " + normalizedCode));
        }

        List<ItemAlias> matches = itemAliasRepository.findAllByCodeIgnoreCase(normalizedCode);
        Set<Long> matchedItemIds = matches.stream()
                .map(alias -> alias.getItem().getId())
                .collect(Collectors.toSet());

        if (matchedItemIds.isEmpty()) {
            throw new ItemNotFoundException("No item found for code: " + normalizedCode);
        }
        if (matchedItemIds.size() > 1) {
            throw new AmbiguousCodeException(normalizedCode);
        }
        return ItemResponse.from(load(matchedItemIds.iterator().next()));
    }

    /**
     * Absolute stock correction. Temporary seam: once the movement ledger exists, this
     * becomes an ADJUSTMENT movement and the balance stops being written directly.
     */
    @Transactional
    public ItemResponse changeQuantity(Long id, QuantityAdjustmentRequest request) {
        Item item = load(id);
        BigDecimal previous = item.getQuantity();
        item.changeQuantityTo(request.quantity());

        log.info("Item {} quantity changed from {} to {}. Reason: {}",
                id, previous, request.quantity(), request.reason());

        return ItemResponse.from(item);
    }

    /** Soft delete: the item stops being listed but keeps its balance and history. */
    @Transactional
    public void deactivate(Long id) {
        load(id).setActive(false);
    }

    @Transactional
    public void activate(Long id) {
        load(id).setActive(true);
    }

    private Item load(Long id) {
        return itemRepository.findWithRelationsById(id)
                .orElseThrow(() -> new ItemNotFoundException(id));
    }

    private Set<Category> loadActiveCategories(Set<Long> categoryIds) {
        List<Category> found = categoryRepository.findAllByIdInAndActiveTrue(categoryIds);
        if (found.size() != categoryIds.size()) {
            Set<Long> foundIds = found.stream().map(Category::getId).collect(Collectors.toSet());
            List<Long> missing = categoryIds.stream().filter(id -> !foundIds.contains(id)).toList();
            throw new CategoryNotFoundException("Categories not found or inactive: " + missing);
        }
        return new LinkedHashSet<>(found);
    }

    /**
     * Replaces the alias set with the requested one, removing only what disappeared and
     * inserting only what is new. A clear-and-reinsert would break the (source, code)
     * unique constraint because Hibernate flushes inserts before deletes.
     */
    private void syncAliases(Item item, List<ItemAliasRequest> requested) {
        List<ItemAliasRequest> normalized = normalizeAliases(requested);

        Set<String> requestedKeys = normalized.stream()
                .map(alias -> aliasKey(alias.source(), alias.code()))
                .collect(Collectors.toSet());

        item.getAliases().removeIf(existing ->
                !requestedKeys.contains(aliasKey(existing.getSource(), existing.getCode())));

        Set<String> currentKeys = item.getAliases().stream()
                .map(existing -> aliasKey(existing.getSource(), existing.getCode()))
                .collect(Collectors.toSet());

        for (ItemAliasRequest alias : normalized) {
            if (currentKeys.contains(aliasKey(alias.source(), alias.code()))) {
                continue;
            }
            ensureAliasIsAvailable(item.getId(), alias);
            item.addAlias(new ItemAlias(alias.code(), alias.source()));
        }
    }

    private List<ItemAliasRequest> normalizeAliases(List<ItemAliasRequest> requested) {
        if (requested == null || requested.isEmpty()) {
            return List.of();
        }

        List<ItemAliasRequest> normalized = new ArrayList<>(requested.size());
        Set<String> seen = new HashSet<>();

        for (ItemAliasRequest alias : requested) {
            String code = normalizeCode(alias.code());
            String source = normalizeSource(alias.source());
            if (!seen.add(aliasKey(source, code))) {
                throw new DuplicateCodeException("Duplicated alias in request: " + source + "/" + code);
            }
            normalized.add(new ItemAliasRequest(code, source));
        }
        return normalized;
    }

    private void ensureAliasIsAvailable(Long itemId, ItemAliasRequest alias) {
        boolean taken = itemId == null
                ? itemAliasRepository.existsBySourceIgnoreCaseAndCodeIgnoreCase(alias.source(), alias.code())
                : itemAliasRepository.existsBySourceIgnoreCaseAndCodeIgnoreCaseAndItem_IdNot(
                        alias.source(), alias.code(), itemId);

        if (taken) {
            throw new DuplicateCodeException(
                    "Alias already assigned to another item: " + alias.source() + "/" + alias.code());
        }
    }

    private String aliasKey(String source, String code) {
        return source.toUpperCase() + "::" + code.toUpperCase();
    }

    /**
     * Uppercase because the database unique constraint is case sensitive while the
     * application treats codes as case insensitive. Normalizing keeps both rules aligned.
     */
    private String normalizeCode(String code) {
        return code.trim().toUpperCase();
    }

    private String normalizeSource(String source) {
        return source.trim().toUpperCase();
    }

    private String normalizeDescription(String description) {
        if (description == null) {
            return null;
        }
        String trimmed = description.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
