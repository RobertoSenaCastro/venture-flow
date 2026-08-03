package br.com.venture.ventureflow.inventory.model.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.Set;

/**
 * Stock item.
 *
 * <p>Supersedes the previous {@code Product} class. At least one category is required;
 * the constraint is declared on the request DTO and re-checked by the service.
 */
@Entity
@Table(
        name = "items",
        uniqueConstraints = @UniqueConstraint(name = "uk_items_code", columnNames = "code")
)
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Internal code owned by this system. External codes live in {@link ItemAlias}. */
    @Column(nullable = false, length = 50)
    private String code;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private MeasurementUnit unit;

    /**
     * Current on-hand balance.
     *
     * <p>Written only through {@link #changeQuantityTo(BigDecimal)} so that a future
     * movement ledger can become the source of truth without changing every caller.
     */
    @Column(nullable = false, precision = 12, scale = 3)
    private BigDecimal quantity = BigDecimal.ZERO;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "item_categories",
            joinColumns = @JoinColumn(name = "item_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<Category> categories = new LinkedHashSet<>();

    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<ItemAlias> aliases = new LinkedHashSet<>();

    protected Item() {
        // Required by JPA.
    }

    public Item(String code, String name, String description, MeasurementUnit unit) {
        this.code = code;
        this.name = name;
        this.description = description;
        this.unit = unit;
        this.quantity = BigDecimal.ZERO;
        this.active = true;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void replaceCategories(Collection<Category> newCategories) {
        this.categories.clear();
        this.categories.addAll(newCategories);
    }

    public void addAlias(ItemAlias alias) {
        alias.setItem(this);
        this.aliases.add(alias);
    }

    /** Rejects negative balances. Any other business rule belongs to the future ledger. */
    public void changeQuantityTo(BigDecimal newQuantity) {
        if (newQuantity == null || newQuantity.signum() < 0) {
            throw new IllegalArgumentException("Quantity must be zero or positive");
        }
        this.quantity = newQuantity;
    }

    public Long getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public MeasurementUnit getUnit() {
        return unit;
    }

    public void setUnit(MeasurementUnit unit) {
        this.unit = unit;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public Set<Category> getCategories() {
        return categories;
    }

    /** Mutable on purpose: orphan removal deletes rows dropped from this collection. */
    public Set<ItemAlias> getAliases() {
        return aliases;
    }
}
