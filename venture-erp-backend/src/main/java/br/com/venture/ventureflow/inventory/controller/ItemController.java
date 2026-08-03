package br.com.venture.ventureflow.inventory.controller;

import br.com.venture.ventureflow.inventory.model.dto.ItemRequest;
import br.com.venture.ventureflow.inventory.model.dto.ItemResponse;
import br.com.venture.ventureflow.inventory.model.dto.QuantityAdjustmentRequest;
import br.com.venture.ventureflow.inventory.model.service.ItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @PostMapping
    public ResponseEntity<ItemResponse> create(@Valid @RequestBody ItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(itemService.create(request));
    }

    /** Optional categoryIds filter; no pagination yet. */
    @GetMapping
    public ResponseEntity<List<ItemResponse>> findAllActive(
            @RequestParam(required = false) List<Long> categoryIds) {
        return ResponseEntity.ok(itemService.findActiveByCategories(categoryIds));
    }

    @GetMapping("/trash")
    public ResponseEntity<List<ItemResponse>> findAllInactive() {
        return ResponseEntity.ok(itemService.findAllInactive());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(itemService.findById(id));
    }

    /** Resolves an internal code or an alias. Intended for imports. */
    @GetMapping("/lookup")
    public ResponseEntity<ItemResponse> lookup(@RequestParam String code,
                                               @RequestParam(required = false) String source) {
        return ResponseEntity.ok(itemService.findByAnyCode(code, source));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemResponse> update(@PathVariable Long id,
                                               @Valid @RequestBody ItemRequest request) {
        return ResponseEntity.ok(itemService.update(id, request));
    }

    /** The only endpoint that writes the stock balance. */
    @PatchMapping("/{id}/quantity")
    public ResponseEntity<ItemResponse> changeQuantity(@PathVariable Long id,
                                                       @Valid @RequestBody QuantityAdjustmentRequest request) {
        return ResponseEntity.ok(itemService.changeQuantity(id, request));
    }

    /** Soft delete. There is no physical delete endpoint. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        itemService.deactivate(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<Void> activate(@PathVariable Long id) {
        itemService.activate(id);
        return ResponseEntity.noContent().build();
    }
}
