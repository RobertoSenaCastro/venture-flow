import "../styles/CreateSalesOrderPage.css";

import BackButton from
    "../../../shared/components/BackButton";

import {
    useEffect,
    useState,
    type FormEvent,
} from "react";

import { getActiveResellers } from
    "../../reseller/api/resellerApi";

import type { ResellerOption } from
    "../../reseller/types/reseller";

import { useNavigate } from "react-router-dom";

import { createSalesOrder } from
    "../api/salesOrderApi";

export function CreateSalesOrderPage() {

    const [name, setName] = useState("");

    const [description, setDescription] =
        useState("");

    const navigate = useNavigate();

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [submitError, setSubmitError] =
        useState("");

    const [resellers, setResellers] =
        useState<ResellerOption[]>([]);

    // HTML select values are strings, so the ID will be converted
    // to a number only when the form is submitted.
    const [selectedResellerId, setSelectedResellerId] =
        useState("");

    const [isLoadingResellers, setIsLoadingResellers] =
        useState(true);

    const [resellerLoadError, setResellerLoadError] =
        useState("");

    useEffect(() => {
        async function loadResellers(): Promise<void> {
            try {
                setIsLoadingResellers(true);
                setResellerLoadError("");

                const activeResellers =
                    await getActiveResellers();

                setResellers(activeResellers);
            } catch {
                setResellerLoadError(
                    "Could not load the resellers.",
                );
            } finally {
                setIsLoadingResellers(false);
            }
        }

        void loadResellers();
    }, []);

    async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
): Promise<void> {
    // Prevents the browser from reloading the page when the form is submitted.
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
        setSubmitError(
            "The sales order name is required.",
        );
        return;
    }

    if (!selectedResellerId) {
        setSubmitError(
            "A reseller must be selected.",
        );
        return;
    }

    try {
        setIsSubmitting(true);
        setSubmitError("");

        await createSalesOrder({
            name: trimmedName,
            description: trimmedDescription,

            // A new sales order always begins with the CREATED status.
            status: "CREATED",

            // HTML select values are strings, but the backend expects a number.
            resellerId: Number(selectedResellerId),
        });

        // Return to the list only after the backend confirms the creation.
        navigate("/sales-orders");
    } catch (error: unknown) {
        if (error instanceof Error) {
            setSubmitError(error.message);
        } else {
            setSubmitError(
                "An unexpected error occurred while creating the sales order.",
            );
        }
    } finally {
        setIsSubmitting(false);
    }
}

   return (
    <main className="page create-sales-order-page">
        <BackButton
            to="/sales-orders"
            label="Pedidos de venda"
        />

        <header className="create-sales-order-header">
            <p className="eyebrow">
                Sales orders
            </p>

            <h1>New sales order</h1>

            <p className="page-description">
                Enter the basic information required to create
                a new sales order.
            </p>
        </header>

        <section className="create-sales-order-card">
            <form
                className="create-sales-order-form"
                onSubmit={handleSubmit}
            >
                <div className="create-sales-order-field">
                    <label htmlFor="name">
                        Name
                    </label>

                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={name}
                        onChange={(event) => {
                            setName(event.target.value);
                        }}
                        maxLength={150}
                        disabled={isSubmitting}
                        required
                    />
                </div>

                <div className="create-sales-order-field">
                    <label htmlFor="description">
                        Description
                    </label>

                    <textarea
                        id="description"
                        name="description"
                        value={description}
                        onChange={(event) => {
                            setDescription(event.target.value);
                        }}
                        maxLength={500}
                        disabled={isSubmitting}
                    />
                </div>

                <div className="create-sales-order-field">
                    <label htmlFor="reseller">
                        Reseller
                    </label>

                    <select
                        id="reseller"
                        name="reseller"
                        value={selectedResellerId}
                        onChange={(event) => {
                            setSelectedResellerId(
                                event.target.value,
                            );
                        }}
                        disabled={
                            isLoadingResellers ||
                            isSubmitting ||
                            Boolean(resellerLoadError) ||
                            resellers.length === 0
                        }
                        required
                    >
                        <option value="">
                            {isLoadingResellers
                                ? "Loading resellers..."
                                : "Select a reseller"}
                        </option>

                        {resellers.map((reseller) => (
                            <option
                                key={reseller.id}
                                value={reseller.id}
                            >
                                {reseller.name}
                            </option>
                        ))}
                    </select>
                </div>

                {resellerLoadError && (
                    <div
                        className="create-sales-order-error"
                        role="alert"
                    >
                        {resellerLoadError}
                    </div>
                )}

                {submitError && (
                    <div
                        className="create-sales-order-error"
                        role="alert"
                    >
                        {submitError}
                    </div>
                )}

                <div className="create-sales-order-actions">
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() => {
                            navigate("/sales-orders");
                        }}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={
                            isSubmitting ||
                            isLoadingResellers ||
                            !name.trim() ||
                            !selectedResellerId
                        }
                    >
                        {isSubmitting
                            ? "Creating..."
                            : "Create sales order"}
                    </button>
                </div>
            </form>
        </section>
    </main>
);
}
