document.addEventListener("DOMContentLoaded", () => {
    // --- Seletores de Elementos ---
    const cartContainer = document.getElementById("cart-items");
    const cartTotalEl = document.getElementById("cart-total");
    const cartCountEl = document.getElementById("cart-count");
    const orderIdEl = document.getElementById("order-id");

    // Botões do Checkout
    const openPixModalBtn = document.getElementById("open-pix-modal"); // Botão principal
    const finalizeBtnWhatsapp = document.getElementById("finalize-order-whatsapp"); // Botão DENTRO do modal

    // Elementos do Modal
    const pixModal = document.getElementById("pix-modal");
    const closeModalBtn = document.getElementById("pix-modal-close");
    const pixTotalModalEl = document.getElementById("pix-total-modal");

    // Seleciona os DOIS botões de copiar
    const copyPixKeyBtn = document.getElementById("copy-pix-key"); // Botão principal
    const copyPixKeyInlineBtn = document.getElementById("copy-pix-key-inline"); // Botão-ícone

    const pixKeyInput = document.getElementById("pix-key");

    // Elementos de Sugestão e Container
    const suggestionsContainer = document.getElementById("cart-suggestions");
    const checkoutContainerEl = document.querySelector(".checkout-container");

    // --- Dados e Configurações ---
    const availableProducts = [
        { name: "Cookie Tradicional", price: 10.00, image: "img/tradicional.jpg" },
        { name: "Cookie de Nutella", price: 12.50, image: "img/nutella.jpg" }
    ];

    const phoneNumber = "5512991030948";

    // Gera ID de pedido
    const generateOrderId = () => {
        const d = new Date();
        return `OS-${String(d.getDate()).padStart(2, "0")}${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}`;
    };
    if (orderIdEl) orderIdEl.textContent = generateOrderId();

    let cart = JSON.parse(localStorage.getItem("buonoCart")) || [];
    let currentTotal = 0;

    // --- Funções Principais ---

    const money = v => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const save = () => localStorage.setItem("buonoCart", JSON.stringify(cart));

    const updateCartCount = () => {
        const total = cart.reduce((s, it) => s + (it.qty || 1), 0);
        if (cartCountEl) cartCountEl.textContent = total;
    };

    const resolveImagePath = (imgPath) => {
        if (!imgPath) return "img/tradicional.jpg";
        if (imgPath.startsWith("/") || imgPath.startsWith("http")) return imgPath;
        if (imgPath.startsWith("./")) return imgPath.replace("./", "");
        if (imgPath.startsWith("img/")) return imgPath;
        return "img/" + imgPath;
    };

    const renderSuggestions = () => {
        if (!suggestionsContainer) return;
        const itemsInCart = new Set(cart.map(item => item.name));
        const itemsToSuggest = availableProducts.filter(prod => !itemsInCart.has(prod.name));

        if (itemsToSuggest.length === 0) {
            suggestionsContainer.innerHTML = "";
            return;
        }

        const title = cart.length === 0 ? "Que tal adicionar um destes?" : "Que tal adicionar também?";
        let html = `<h3 class="suggestions-title">${title}</h3><div class="suggestions-grid">`;
        itemsToSuggest.forEach(item => {
            html += `
            <div class="suggestion-card" data-name="${item.name}" data-price="${item.price}" data-image="${item.image}">
                <img src="${resolveImagePath(item.image)}" alt="${item.name}">
                <h4>${item.name}</h4>
                <span class="price">${money(item.price)}</span>
                <button class="add-suggestion-btn"><i class="bi bi-cart-plus"></i> Adicionar</button>
            </div>`;
        });
        html += `</div>`;
        suggestionsContainer.innerHTML = html;
    };

    const render = () => {
        if (!cartContainer) return;
        cartContainer.innerHTML = "";
        currentTotal = 0; // Reseta o total global

        if (cart.length === 0) {
            cartContainer.innerHTML = `<p class="empty">Seu carrinho está vazio 🍪</p>`;
            if (cartTotalEl) cartTotalEl.textContent = "R$ 0,00";
        } else {
            cart.forEach((item, idx) => {
                const subtotal = (item.price || 0) * (item.qty || 1);
                const el = document.createElement("div");
                el.className = "cart-item";
                let imagePath = item.image || "";
                const nameLower = (item.name || "").toLowerCase();
                if (!imagePath) {
                    imagePath = nameLower.includes("nutella") ? "img/nutella.jpg" : "img/tradicional.jpg";
                }
                imagePath = resolveImagePath(imagePath);

                el.innerHTML = `
                    <img src="${imagePath}" alt="${(item.name || 'Item')}">
                    <div class="item-info">
                        <h3>${item.name || "Item"}</h3>
                        <div class="meta-row"><span class="price">${money(item.price || 0)}</span></div>
                    </div>
                    <div class="quantity" aria-label="Quantidade">
                        <button class="decrease" data-i="${idx}" aria-label="Diminuir">−</button>
                        <span class="qty">${item.qty || 1}</span>
                        <button class="increase" data-i="${idx}" aria-label="Aumentar">+</button>
                    </div>
                    <button class="remove" data-i="${idx}" aria-label="Remover item"><i class="bi bi-trash"></i></button>
                    <div class="item-actions"><span class="subtotal">${money(subtotal)}</span></div>
                `;
                cartContainer.appendChild(el);
            });

            currentTotal = cart.reduce((s, it) => s + (it.price || 0) * (it.qty || 1), 0);
            if (cartTotalEl) cartTotalEl.textContent = money(currentTotal);
        }

        updateCartCount();
        renderSuggestions();
    };

    // --- Funções do Modal PIX ---

    const openModal = () => {
        if (pixModal) {
            if (pixTotalModalEl) pixTotalModalEl.textContent = money(currentTotal);
            pixModal.classList.add("active");
            document.body.style.overflow = 'hidden';
        }
    };

    const closeModal = () => {
        if (pixModal) {
            pixModal.classList.remove("active");
            document.body.style.overflow = '';
        }
    };

    // 👇 MUDANÇA AQUI: Função de copiar atualizada para feedback MINIMALISTA 👇

    // Salva o HTML original do ícone-botão e o valor do input
    const originalInlineIconHTML = copyPixKeyInlineBtn?.innerHTML;
    const originalPixKeyValue = pixKeyInput?.value;

    const copyPixKey = () => {
        if (pixKeyInput) {
            pixKeyInput.select();
            document.execCommand("copy");

            // Feedback visual MINIMALISTA: Muda o texto do input E o ícone inline
            pixKeyInput.value = "✓ Copiado!";
            pixKeyInput.classList.add("copied"); // Adiciona classe para estilo

            if (copyPixKeyInlineBtn) {
                copyPixKeyInlineBtn.innerHTML = `<i class="bi bi-check-lg"></i>`; // Muda para check
            }

            // Desabilita os dois botões
            if (copyPixKeyBtn) copyPixKeyBtn.disabled = true;
            if (copyPixKeyInlineBtn) copyPixKeyInlineBtn.disabled = true;


            // Restaura tudo após 2 segundos
            setTimeout(() => {
                pixKeyInput.value = originalPixKeyValue;
                pixKeyInput.classList.remove("copied"); // Remove classe

                if (copyPixKeyBtn) copyPixKeyBtn.disabled = false;
                if (copyPixKeyInlineBtn) {
                    copyPixKeyInlineBtn.innerHTML = originalInlineIconHTML; // Restaura ícone
                    copyPixKeyInlineBtn.disabled = false;
                }
            }, 2000);
        }
    };

    // --- Listeners de Eventos ---

    // Gerencia o carrinho (Adicionar, Remover, Aumentar, Diminuir)
    checkoutContainerEl?.addEventListener("click", (ev) => {
        const btn = ev.target.closest("button");
        if (!btn) return;

        if (btn.classList.contains("add-suggestion-btn")) {
            const card = btn.closest(".suggestion-card");
            const name = card.dataset.name;
            const price = parseFloat(card.dataset.price);
            const image = card.dataset.image;
            const i = cart.findIndex(it => it.name === name);
            (i > -1) ? cart[i].qty++ : cart.push({ name, price, image, qty: 1 });
            save();
            render();
            return;
        }

        const i = parseInt(btn.dataset.i, 10);
        if (Number.isNaN(i)) return;

        if (btn.classList.contains("increase")) cart[i].qty = Math.min(30, (cart[i].qty || 1) + 1);
        else if (btn.classList.contains("decrease")) cart[i].qty = Math.max(1, (cart[i].qty || 1) - 1);
        else if (btn.classList.contains("remove")) cart.splice(i, 1);

        save();
        render();
    });

    // 1. Botão Principal: "Ir para Pagamento PIX"
    openPixModalBtn?.addEventListener("click", () => {
        if (cart.length === 0) {
            alert("Seu carrinho está vazio. Adicione um cookie!");
            return;
        }

        const customerNameEl = document.getElementById("customer-name");
        const customerName = (customerNameEl?.value || "").trim();

        if (!customerName) {
            alert("Por favor, digite seu nome para continuar.");
            customerNameEl?.focus();
            return;
        }

        openModal();
    });

    // 2. Botão Final: "Enviar Comprovante e Pedido" (Dentro do Modal)
    finalizeBtnWhatsapp?.addEventListener("click", (e) => {
        e.preventDefault();

        const customerName = (document.getElementById("customer-name")?.value || "").trim();
        const paymentMethod = (document.getElementById("payment-method")?.value || "PIX").toUpperCase();
        const orderId = orderIdEl ? orderIdEl.textContent : "N/A";

        const itens = cart.map(it =>
            `• *${it.name}* (${it.qty}x) - ${money(it.price * it.qty)}`
        ).join("%0A");

        const nl = "%0A";
        const line = "-----------------------------------" + nl;

        let msg = `🍪 *NOVO PEDIDO BUONO COOKIES* 🍪${nl}${nl}`;
        msg += `Olá! Meu nome é *${customerName}* 👋${nl}Gostaria de fazer o seguinte pedido:${nl}${nl}`;
        msg += `*Pedido:* ${orderId}${nl}${line}`;
        msg += `*Detalhes do Pedido:*${nl}${itens}${nl}${line}`;
        msg += `▶️ *Pagamento:*${nl}${paymentMethod}${nl}${nl}`;
        msg += `*Total:* *${money(currentTotal)}*${nl}${nl}`;
        msg += `*Estou enviando o comprovante do PIX em anexo.*${nl}Obrigado!`;

        const url = `https://wa.me/${phoneNumber}?text=${msg}`;

        cart = [];
        save();

        window.location.href = url;
        closeModal();
        render();
    });

    // Os DOIS botões de copiar chamam a MESMA função
    closeModalBtn?.addEventListener("click", closeModal);
    copyPixKeyBtn?.addEventListener("click", copyPixKey);
    copyPixKeyInlineBtn?.addEventListener("click", copyPixKey);

    // Inicial render
    render();
});