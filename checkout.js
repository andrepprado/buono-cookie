document.addEventListener("DOMContentLoaded", () => {

    // ---------- Seletores ----------
    const cartContainer = document.getElementById("cart-items");
    const cartTotalEl = document.getElementById("cart-total");
    const cartCountEl = document.getElementById("cart-count");
    const orderIdEl = document.getElementById("order-id");

    const openPixModalBtn = document.getElementById("open-pix-modal");
    const finalizeBtnWhatsapp = document.getElementById("finalize-order-whatsapp");

    const pixModal = document.getElementById("pix-modal");
    const closeModalBtn = document.getElementById("pix-modal-close");
    const pixTotalModalEl = document.getElementById("pix-total-modal");

    const copyPixKeyBtn = document.getElementById("copy-pix-key");
    const copyPixKeyInlineBtn = document.getElementById("copy-pix-key-inline");
    const pixKeyInput = document.getElementById("pix-key");

    const suggestionsContainer = document.getElementById("cart-suggestions");
    const checkoutContainerEl = document.querySelector(".checkout-container");

    // ---------- Catálogo ----------
    const PRODUCTS = [
        {
            name: "Cookie Tradicional", price: 12.50, image: "img/webp/tradicional_gmni.webp"
        },
        {
            name: "Cookie de Nutella", price: 15.00, image: "img/webp/nutella_gmni.webp"
        },
        {
            name: "Cookie Bueno", price: 15.00, image: "img/webp/bueno.webp"
        }
        /*{ name: "Cookie de Pote - Cheesecake", price: 19.00, image: "img/webp/morango_pote_gmni.webp" },
        { name: "Cookie de Pote - Ovomaltine", price: 21.50, image: "img/webp/ovomaltine_pote_gmni.webp" },
        { name: "Cookie de Pote - Bueno", price: 21.50, image: "img/webp/bueno_pote_gmni.webp" }*/
    ];

    const getProduct = (name) => PRODUCTS.find(p => p.name === name);

    const phoneNumber = "5512991030948";

    const generateOrderId = () => {
        const d = new Date();
        return `OS-${String(d.getDate()).padStart(2, "0")}${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}`;
    };

    if (orderIdEl) orderIdEl.textContent = generateOrderId();

    let cart = JSON.parse(localStorage.getItem("buonoCart")) || [];
    let currentTotal = 0;
    let sendingOrder = false;

    const money = v => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const save = () => localStorage.setItem("buonoCart", JSON.stringify(cart));

    const updateCartCount = () => {
        const total = cart.reduce((s, it) => s + (it.qty || 1), 0);
        if (cartCountEl) cartCountEl.textContent = total;
    };

    const resolveImagePath = (imgPath) => {

        // fallback absoluto
        if (!imgPath) return "img/webp/tradicional_gmni.webp";

        // já é url completa
        if (imgPath.startsWith("http") || imgPath.startsWith("/"))
            return imgPath;

        // já está correto em webp
        if (imgPath.includes("img/webp/"))
            return imgPath;

        // veio só o nome do arquivo
        if (!imgPath.includes("/"))
            return "img/webp/" + imgPath.replace(/\.(png|jpg|jpeg)$/i, ".webp");

        // veio caminho antigo tipo img/xxx.png
        if (imgPath.startsWith("img/"))
            return imgPath
                .replace("img/", "img/webp/")
                .replace(/\.(png|jpg|jpeg)$/i, ".webp");

        // fallback final
        return "img/webp/tradicional_gmni.webp";
    };

    // ---------- Sugestões ----------
    const renderSuggestions = () => {
        if (!suggestionsContainer) return;

        const itemsInCart = new Set(cart.map(i => i.name));
        const itemsToSuggest = PRODUCTS.filter(p => !itemsInCart.has(p.name));

        if (!itemsToSuggest.length) {
            suggestionsContainer.innerHTML = "";
            return;
        }

        let html = `<h3 class="suggestions-title">${cart.length ? "Que tal adicionar também?" : "Que tal adicionar um destes?"}</h3><div class="suggestions-grid">`;

        itemsToSuggest.forEach(item => {
            html += `
            <div class="suggestion-card" data-name="${item.name}" data-price="${item.price}" data-image="${item.image}">
                <img src="${resolveImagePath(item.image)}">
                <h4>${item.name}</h4>
                <span class="price">${money(item.price)}</span>
                <button class="add-suggestion-btn"><i class="bi bi-cart-plus"></i> Adicionar</button>
            </div>`;
        });

        html += `</div>`;
        suggestionsContainer.innerHTML = html;
    };

    // ---------- Render Carrinho ----------
    const render = () => {
        if (!cartContainer) return;

        cartContainer.innerHTML = "";
        currentTotal = 0;

        if (!cart.length) {
            cartContainer.innerHTML = `<p class="empty">Seu carrinho está vazio 🍪</p>`;
            if (cartTotalEl) cartTotalEl.textContent = "R$ 0,00";
        } else {

            cart.forEach((item, idx) => {

                const prod = getProduct(item.name);
                if (prod) {
                    item.price = prod.price;
                    item.image = prod.image;
                }

                const subtotal = item.price * item.qty;
                currentTotal += subtotal;

                const el = document.createElement("div");
                el.className = "cart-item";

                const imagePath = resolveImagePath(item.image);

                el.innerHTML = `
                <img src="${imagePath}">
                <div class="item-info">
                    <h3>${item.name}</h3>
                    <span class="price">${money(item.price)}</span>
                </div>
                <div class="quantity">
                    <button class="decrease" data-i="${idx}">−</button>
                    <span class="qty">${item.qty}</span>
                    <button class="increase" data-i="${idx}">+</button>
                </div>
                <button class="remove" data-i="${idx}"><i class="bi bi-trash"></i></button>
                <div class="item-actions">
                    <span class="subtotal">${money(subtotal)}</span>
                </div>`;

                cartContainer.appendChild(el);
            });

            if (cartTotalEl) cartTotalEl.textContent = money(currentTotal);
            save();
        }

        updateCartCount();
        renderSuggestions();
    };

    // ---------- Modal ----------
    const openModal = () => {
        if (pixModal) {
            pixTotalModalEl.textContent = money(currentTotal);
            pixModal.classList.add("active");
            document.body.style.overflow = "hidden";
        }
    };

    const closeModal = () => {
        if (pixModal) {
            pixModal.classList.remove("active");
            document.body.style.overflow = "";
        }
    };

    // ---------- COPIAR PIX (CORRIGIDO) ----------
    const originalInlineIconHTML = copyPixKeyInlineBtn?.innerHTML;
    const originalPixKeyValue = pixKeyInput?.value;

    function copyPixKey() {

        if (!pixKeyInput) return;

        pixKeyInput.select();
        document.execCommand("copy");

        pixKeyInput.value = "✓ Copiado!";
        pixKeyInput.classList.add("copied");

        copyPixKeyBtn.classList.add("copied");
        copyPixKeyBtn.innerHTML = `<i class="bi bi-check-lg"></i> Chave Copiada`;

        if (copyPixKeyInlineBtn)
            copyPixKeyInlineBtn.innerHTML = `<i class="bi bi-check-lg"></i>`;

        copyPixKeyBtn.disabled = true;
        copyPixKeyInlineBtn.disabled = true;

        setTimeout(() => {

            pixKeyInput.value = originalPixKeyValue;
            pixKeyInput.classList.remove("copied");

            copyPixKeyBtn.classList.remove("copied");
            copyPixKeyBtn.innerHTML = `<i class="bi bi-clipboard"></i> Copiar Chave`;

            copyPixKeyBtn.disabled = false;

            if (copyPixKeyInlineBtn) {
                copyPixKeyInlineBtn.innerHTML = originalInlineIconHTML;
                copyPixKeyInlineBtn.disabled = false;
            }

        }, 2000);
    }

    // ---------- Eventos Carrinho ----------
    checkoutContainerEl?.addEventListener("click", (ev) => {
        const btn = ev.target.closest("button");
        if (!btn) return;

        if (btn.classList.contains("add-suggestion-btn")) {
            const card = btn.closest(".suggestion-card");
            const name = card.dataset.name;
            const price = parseFloat(card.dataset.price);
            const image = card.dataset.image;

            const i = cart.findIndex(it => it.name === name);
            i > -1 ? cart[i].qty++ : cart.push({ name, price, image, qty: 1 });

            save();
            render();
            return;
        }

        const i = parseInt(btn.dataset.i);
        if (isNaN(i)) return;

        if (btn.classList.contains("increase")) cart[i].qty++;
        else if (btn.classList.contains("decrease")) cart[i].qty = Math.max(1, cart[i].qty - 1);
        else if (btn.classList.contains("remove")) cart.splice(i, 1);

        save();
        render();
    });

    // ---------- Abrir Modal ----------
    openPixModalBtn?.addEventListener("click", () => {
        if (!cart.length) {
            alert("Seu carrinho está vazio.");
            return;
        }

        const name = document.getElementById("customer-name").value.trim();
        if (!name) {
            alert("Digite seu nome.");
            return;
        }

        openModal();
    });

    // ---------- ENVIO WHATSAPP (APENAS NO CLIQUE) ----------
    finalizeBtnWhatsapp?.addEventListener("click", (e) => {
        e.preventDefault();
        if (sendingOrder) return;

        sendingOrder = true;
        finalizeBtnWhatsapp.innerHTML = "Enviando...";
        finalizeBtnWhatsapp.style.pointerEvents = "none";

        const customerName = document.getElementById("customer-name").value.trim();
        const paymentMethod = document.getElementById("payment-method").value.toUpperCase();
        const orderId = orderIdEl.textContent;

        const itens = cart.map(it =>
            `* ${it.name} (${it.qty}x) - ${money(it.price * it.qty)}`
        ).join("\n");

        const nl = "\n";
        const line = "-----------------------------------";

        let msg =
            `🍪 NOVO PEDIDO BUONO COOKIES 🍪${nl}${nl}
Olá! Meu nome é ${customerName} 👋${nl}
Gostaria de fazer o seguinte pedido:${nl}${nl}
Pedido: ${orderId}${nl}${line}${nl}
Detalhes do Pedido:${nl}
${itens}${nl}${line}${nl}
▶️ Pagamento:${nl}
${paymentMethod}${nl}${nl}
Total: ${money(currentTotal)}${nl}${nl}
Estou enviando o comprovante do PIX em anexo.${nl}
Obrigado!`;

        msg = encodeURIComponent(msg);

        const appUrl = `whatsapp://send?phone=${phoneNumber}&text=${msg}`;
        const webUrl = `https://wa.me/${phoneNumber}?text=${msg}`;

        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);

        cart = [];
        save();

        if (isIOS) {
            window.location.href = appUrl;
            setTimeout(() => window.location.href = webUrl, 1500);
        }
        else if (isAndroid) {
            window.location.href = webUrl;
        }
        else {
            window.open(webUrl, "_blank");
        }

        closeModal();
        render();
    });

    closeModalBtn?.addEventListener("click", closeModal);
    copyPixKeyBtn?.addEventListener("click", copyPixKey);
    copyPixKeyInlineBtn?.addEventListener("click", copyPixKey);

    render();
});
