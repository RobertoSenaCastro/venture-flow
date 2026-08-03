package br.com.venture.ventureflow.inventory.model.service;

import br.com.venture.ventureflow.inventory.exception.CategoryNotFoundException;
import br.com.venture.ventureflow.inventory.exception.DuplicateCodeException;
import br.com.venture.ventureflow.inventory.model.dto.CategoryRequest;
import br.com.venture.ventureflow.inventory.model.dto.CategoryResponse;
import br.com.venture.ventureflow.inventory.model.entity.Category;
import br.com.venture.ventureflow.inventory.model.repository.CategoryRepository;
import br.com.venture.ventureflow.inventory.model.repository.ItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private static final Logger log = LoggerFactory.getLogger(CategoryService.class);

    private final CategoryRepository categoryRepository;
    private final ItemRepository itemRepository;

    public CategoryService(CategoryRepository categoryRepository, ItemRepository itemRepository) {
        this.categoryRepository = categoryRepository;
        this.itemRepository = itemRepository;
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        String code = normalizeCode(request.code());
        if (categoryRepository.existsByCodeIgnoreCase(code)) {
            throw new DuplicateCodeException("Category code already in use: " + code);
        }

        Category category = new Category(code, request.name().trim(), normalizeDescription(request.description()));
        return CategoryResponse.from(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = load(id);
        String code = normalizeCode(request.code());
        if (categoryRepository.existsByCodeIgnoreCaseAndIdNot(code, id)) {
            throw new DuplicateCodeException("Category code already in use: " + code);
        }

        category.setCode(code);
        category.setName(request.name().trim());
        category.setDescription(normalizeDescription(request.description()));
        return CategoryResponse.from(category);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> findAllActive() {
        return categoryRepository.findAllByActiveTrueOrderByNameAsc().stream()
                .map(CategoryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> findAllInactive() {
        return categoryRepository.findAllByActiveFalseOrderByNameAsc().stream()
                .map(CategoryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse findById(Long id) {
        return CategoryResponse.from(load(id));
    }

    /**
     * Soft delete. Existing items keep the association, but the category can no longer be
     * assigned, so updating those items will fail until the category is reactivated or the
     * item is reclassified. Blocking deactivation of a category in use is a pending decision.
     */
    @Transactional
    public void deactivate(Long id) {
        Category category = load(id);
        if (itemRepository.existsByCategories_Id(id)) {
            log.warn("Deactivating category {} that is still referenced by items", id);
        }
        category.setActive(false);
    }

    @Transactional
    public void activate(Long id) {
        load(id).setActive(true);
    }

    private Category load(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryNotFoundException("Category not found: " + id));
    }

    /**
     * Uppercase because the database unique constraint is case sensitive while the
     * application treats codes as case insensitive. Normalizing keeps both rules aligned.
     */
    private String normalizeCode(String code) {
        return code.trim().toUpperCase();
    }

    private String normalizeDescription(String description) {
        if (description == null) {
            return null;
        }
        String trimmed = description.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
