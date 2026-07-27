package br.com.venture.ventureflow.salesorder.model.entity;

import br.com.venture.ventureflow.reseller.model.entity.Reseller;

import jakarta.persistence.*;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import java.time.LocalDateTime;

@Entity
@Table(name = "sales_orders")
public class SalesOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SalesOrderStatus status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private boolean active;
    
    @ManyToOne(
	    fetch = FetchType.LAZY,
	    optional = false
	)
	@JoinColumn(
	    name = "reseller_id",
	    nullable = false
	)
    private Reseller reseller;

    public SalesOrder() {
    }

    public SalesOrder(
            String code,
            String name,
            String description,
            Reseller reseller,
            SalesOrderStatus status,
            LocalDateTime createdAt
            
    ) {
        this.code = code;
        this.name = name;
        this.description = description;
        this.reseller = reseller;
        this.status = status;
        this.createdAt = createdAt;
        this.active = true;
    }

    public Long getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public SalesOrderStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public boolean isActive() {
        return active;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setStatus(SalesOrderStatus status) {
        this.status = status;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

	public Reseller getReseller() {
		return reseller;
	}

	public void setReseller(Reseller reseller) {
		this.reseller = reseller;
	}
    
    
}
