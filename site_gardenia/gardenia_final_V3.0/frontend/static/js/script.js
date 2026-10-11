/**
 * GARDÊNIA — INTERAÇÕES & ESTADO
 * Moda Feminina Contemporânea & Atemporal
 */

document.addEventListener("DOMContentLoaded", () => {
    // =========================================================================
    // 1. BASE DE PRODUTOS (Fallback elegante caso aberto fora do Flask)
    // =========================================================================
    const DEFAULT_PRODUCTS = [
        // ================= Coleção Feminina =================
        {
            id: 1,
            name: "Vestido Aurora",
            gender: "Feminino",
            category: "Vestidos",
            price: 249.90,
            old_price: 289.90,
            tag: "Novo",
            image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=85",
            description: "Vestido midi em crepe fluido com caimento evasê impecável e decote suave para qualquer momento especial.",
            sizes: ["PP", "P", "M", "G"],
            composition: "100% Viscose de Reflorestamento",
            rating: 4.9,
            reviews_count: 28
        },
        {
            id: 2,
            name: "Camisa Essencial Linho",
            gender: "Feminino",
            category: "Básicos",
            price: 139.90,
            old_price: 169.90,
            tag: "100% Linho",
            image: "https://images.unsplash.com/photo-1605763240000-7e93b172d754?auto=format&fit=crop&w=900&q=85",
            description: "Camisa clássica com corte despojado em puro linho respirável, gola estruturada e toque macio ao corpo.",
            sizes: ["P", "M", "G", "GG"],
            composition: "100% Linho Puro Certificado",
            rating: 5.0,
            reviews_count: 42
        },
        {
            id: 3,
            name: "Blazer Olive Tailored",
            gender: "Feminino",
            category: "Alfaiataria",
            price: 299.90,
            old_price: 349.90,
            tag: "Destaque",
            image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=85",
            description: "Blazer estruturado em tom verde oliva elegante, forro acetinado premium e lapela refinada com caimento impecável.",
            sizes: ["PP", "P", "M", "G"],
            composition: "70% Lã Tropical, 30% Poliéster Reciclado",
            rating: 4.9,
            reviews_count: 35
        },
        {
            id: 4,
            name: "Tricot Serena Canelado",
            gender: "Feminino",
            category: "Malhas",
            price: 179.90,
            old_price: null,
            tag: "Mais Vendido",
            image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85",
            description: "Tricot canelado com toque aveludado de algodão e lã leve. Confortável para os dias amenos e sobreposições.",
            sizes: ["P", "M", "G"],
            composition: "60% Algodão Pima, 40% Lã Merino",
            rating: 4.8,
            reviews_count: 19
        },
        {
            id: 5,
            name: "Saia Luna Midi Evasê",
            gender: "Feminino",
            category: "Casual",
            price: 159.90,
            old_price: 189.90,
            tag: "Tendência",
            image: "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=900&q=85",
            description: "Saia evasê de cintura alta em sarja suave acetinada, com fenda discreta e bolsos laterais utilitários.",
            sizes: ["PP", "P", "M", "G", "GG"],
            composition: "98% Algodão, 2% Elastano",
            rating: 4.9,
            reviews_count: 23
        },
        {
            id: 6,
            name: "Calça Alfaiataria Íris",
            gender: "Feminino",
            category: "Alfaiataria",
            price: 229.90,
            old_price: null,
            tag: "Ateliê",
            image: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=900&q=85",
            description: "Calça reta com cós anatômico duplo, pregas frontais sofisticadas e caimento que alonga a silhueta.",
            sizes: ["36", "38", "40", "42", "44"],
            composition: "92% Viscose Sarjada, 8% Poliéster",
            rating: 5.0,
            reviews_count: 31
        },
        {
            id: 7,
            name: "Vestido Botânica Linho",
            gender: "Feminino",
            category: "Vestidos",
            price: 269.90,
            old_price: 310.00,
            tag: "Exclusivo",
            image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85",
            description: "Vestido em mistura nobre de linho com detalhes pespontados, mangas amplas delicadas e amarração na cintura.",
            sizes: ["PP", "P", "M", "G"],
            composition: "55% Linho Puro, 45% Viscose",
            rating: 4.9,
            reviews_count: 14
        },
        {
            id: 8,
            name: "Regata Ribbed Areia",
            gender: "Feminino",
            category: "Básicos",
            price: 89.90,
            old_price: null,
            tag: "Essencial",
            image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=85",
            description: "Regata em malha canelada encorpada com decote halter elegante. A base perfeita para qualquer composição.",
            sizes: ["PP", "P", "M", "G"],
            composition: "95% Algodão Pima Peruano, 5% Elastano",
            rating: 4.7,
            reviews_count: 51
        },
        {
            id: 9,
            name: "Cardigan Off-White Brisa",
            gender: "Feminino",
            category: "Malhas",
            price: 209.90,
            old_price: 249.90,
            tag: "Conforto",
            image: "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=900&q=85",
            description: "Cardigan oversized em ponto fang artesanal com botões de matéria orgânica. Quente, leve e super versátil.",
            sizes: ["P", "M", "G"],
            composition: "70% Acrílico Soft Touch, 30% Algodão",
            rating: 4.9,
            reviews_count: 17
        },

        // ================= Coleção Masculina =================
        {
            id: 10,
            name: "Camisa Linho Riviera",
            gender: "Masculino",
            category: "Camisas",
            price: 189.90,
            old_price: 229.90,
            tag: "100% Linho Puro",
            image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=85",
            description: "Camisa manga longa em puro linho respirável, gola francesa despojada e botões ecológicos em corozo.",
            sizes: ["P", "M", "G", "GG"],
            composition: "100% Linho Europeu Puro",
            rating: 5.0,
            reviews_count: 38
        },
        {
            id: 11,
            name: "Blazer Alfaiataria Areia",
            gender: "Masculino",
            category: "Alfaiataria",
            price: 349.90,
            old_price: 399.90,
            tag: "Destaque",
            image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=85",
            description: "Blazer desestruturado em sarja leve com forro de cetim italiano e caimento elegante para eventos e reuniões.",
            sizes: ["48", "50", "52", "54"],
            composition: "65% Lã Virgem, 35% Algodão Orgânico",
            rating: 4.9,
            reviews_count: 27
        },
        {
            id: 12,
            name: "Calça Chino Confort",
            gender: "Masculino",
            category: "Alfaiataria",
            price: 229.90,
            old_price: null,
            tag: "Essencial",
            image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=85",
            description: "Calça chino em corte reto contemporâneo com toque peletizado macio, bolsos embutidos e flexibilidade.",
            sizes: ["38", "40", "42", "44"],
            composition: "97% Algodão Nobre, 3% Elastano",
            rating: 4.9,
            reviews_count: 44
        },
        {
            id: 13,
            name: "Tricot Canelado Terracota",
            gender: "Masculino",
            category: "Malhas",
            price: 199.90,
            old_price: 239.90,
            tag: "Mais Vendido",
            image: "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?auto=format&fit=crop&w=900&q=85",
            description: "Suéter clássico gola careca em trama de algodão e lã premium. Perfeito para sobreposições em dias amenos.",
            sizes: ["P", "M", "G", "GG"],
            composition: "50% Algodão Pima, 50% Lã Merino",
            rating: 4.8,
            reviews_count: 22
        },
        {
            id: 14,
            name: "Camiseta Pima Essential",
            gender: "Masculino",
            category: "Básicos",
            price: 99.90,
            old_price: null,
            tag: "Algodão Pima",
            image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=85",
            description: "Camiseta gola C em algodão Pima peruano com caimento regular e toque extremamente aveludado.",
            sizes: ["P", "M", "G", "GG"],
            composition: "100% Algodão Pima Peruano",
            rating: 5.0,
            reviews_count: 65
        },
        {
            id: 15,
            name: "Jaqueta Overshirt Safari",
            gender: "Masculino",
            category: "Casual",
            price: 289.90,
            old_price: 329.90,
            tag: "Novo",
            image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=900&q=85",
            description: "Overshirt utilitária encorpada com quatro bolsos frontais, corte quadrado contemporâneo e toque aveludado.",
            sizes: ["P", "M", "G", "GG"],
            composition: "100% Sarja Pesada de Algodão",
            rating: 4.9,
            reviews_count: 19
        }
    ];

    const products = (window.products && window.products.length > 0) ? window.products : DEFAULT_PRODUCTS;
    const FREE_SHIPPING_THRESHOLD = 250.00;
    const STANDARD_SHIPPING_FEE = 19.90;

    // =========================================================================
    // 2. ESTADO DA APLICAÇÃO (localStorage)
    // =========================================================================
    let cart = JSON.parse(localStorage.getItem("gardenia_cart")) || [];
    let wishlist = JSON.parse(localStorage.getItem("gardenia_wishlist")) || [];
    let appliedCoupon = localStorage.getItem("gardenia_coupon") || null;

    const saveCart = () => localStorage.setItem("gardenia_cart", JSON.stringify(cart));
    const saveWishlist = () => localStorage.setItem("gardenia_wishlist", JSON.stringify(wishlist));

    const formatCurrency = (val) => {
        return "R$ " + Number(val).toFixed(2).replace(".", ",");
    };

    // =========================================================================
    // 3. SISTEMA DE TOASTS FLUTUANTES
    // =========================================================================
    const toastContainer = document.getElementById("toastContainer");
    function showToast(message, icon = "✦") {
        if (!toastContainer) return;
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
        toastContainer.appendChild(toast);

        // Animação de entrada
        requestAnimationFrame(() => toast.classList.add("show"));

        // Remoção suave
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 400);
        }, 3400);
    }

    // =========================================================================
    // 4. TOP BANNER & NAVBAR SCROLL & MENU MOBILE
    // =========================================================================
    const topBanner = document.getElementById("topBanner");
    const closeBanner = document.getElementById("closeBanner");
    const navbar = document.getElementById("navbar");
    const menuBtn = document.getElementById("menuBtn");
    const navLinks = document.getElementById("navLinks");
    const scrollIndicator = document.getElementById("scrollIndicator");
    const backToTopBtn = document.getElementById("backToTopBtn");

    if (closeBanner) {
        closeBanner.addEventListener("click", () => {
            topBanner.classList.add("hidden");
            document.body.classList.add("banner-hidden");
        });
    }

    const handleScroll = () => {
        if (navbar) {
            navbar.classList.toggle("scrolled", window.scrollY > 40);
        }

        // ScrollSpy para itens do menu
        const sections = document.querySelectorAll("section[id]");
        let currentSec = "";
        sections.forEach(sec => {
            const top = sec.offsetTop - 120;
            const height = sec.offsetHeight;
            if (window.scrollY >= top && window.scrollY < top + height) {
                currentSec = sec.getAttribute("id");
            }
        });

        document.querySelectorAll(".nav-links a").forEach(link => {
            link.classList.toggle("active", link.getAttribute("href") === `#${currentSec}`);
        });
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();

    if (menuBtn && navLinks) {
        menuBtn.addEventListener("click", () => {
            navLinks.classList.toggle("open");
        });
        document.querySelectorAll(".nav-links a").forEach(a => {
            a.addEventListener("click", () => navLinks.classList.remove("open"));
        });
    }

    if (scrollIndicator) {
        scrollIndicator.addEventListener("click", () => {
            const intro = document.querySelector(".intro");
            if (intro) intro.scrollIntoView({ behavior: "smooth" });
        });
    }

    if (backToTopBtn) {
        backToTopBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // Intersection Observer para animação reveal
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add("visible");
        });
    }, { threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

    // =========================================================================
    // 5. GESTÃO DA SACOLA DE COMPRAS (CART DRAWER)
    // =========================================================================
    const cartBtn = document.getElementById("cartBtn");
    const cartDrawer = document.getElementById("cartDrawer");
    const cartOverlay = document.getElementById("cartOverlay");
    const closeCartBtn = document.getElementById("closeCartBtn");
    const continueShoppingBtn = document.getElementById("continueShoppingBtn");
    const cartCountEl = document.getElementById("cartCount");
    const cartDrawerCount = document.getElementById("cartDrawerCount");
    const cartItemsList = document.getElementById("cartItemsList");
    const cartFooter = document.getElementById("cartFooter");

    const shippingBarText = document.getElementById("shippingBarText");
    const shippingProgressFill = document.getElementById("shippingProgressFill");

    const cartSubtotalEl = document.getElementById("cartSubtotal");
    const discountRow = document.getElementById("discountRow");
    const cartDiscountEl = document.getElementById("cartDiscount");
    const cartShippingEl = document.getElementById("cartShipping");
    const cartTotalEl = document.getElementById("cartTotal");

    const couponInput = document.getElementById("couponInput");
    const applyCouponBtn = document.getElementById("applyCouponBtn");
    const couponMessage = document.getElementById("couponMessage");

    function openCart() {
        if (cartDrawer && cartOverlay) {
            cartDrawer.classList.add("open");
            cartOverlay.classList.add("active");
            cartDrawer.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
        }
    }

    function closeCart() {
        if (cartDrawer && cartOverlay) {
            cartDrawer.classList.remove("open");
            cartOverlay.classList.remove("active");
            cartDrawer.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        }
    }

    if (cartBtn) cartBtn.addEventListener("click", openCart);
    if (closeCartBtn) closeCartBtn.addEventListener("click", closeCart);
    if (cartOverlay) cartOverlay.addEventListener("click", closeCart);
    if (continueShoppingBtn) continueShoppingBtn.addEventListener("click", closeCart);

    function updateCartUI() {
        const totalItemsCount = cart.reduce((acc, item) => acc + item.qty, 0);
        if (cartCountEl) cartCountEl.textContent = totalItemsCount;
        if (cartDrawerCount) cartDrawerCount.textContent = `(${totalItemsCount} ${totalItemsCount === 1 ? "item" : "itens"})`;

        if (cart.length === 0) {
            cartItemsList.innerHTML = `
                <div class="empty-drawer-box">
                    <div class="empty-drawer-icon">🛍</div>
                    <h4>Sua sacola está vazia</h4>
                    <p>Descubra nossas coleções e adicione peças atemporais ao seu guarda-roupa.</p>
                    <button class="primary-btn" id="emptyCartExploreBtn">Explorar Produtos</button>
                </div>
            `;
            const exploreBtn = document.getElementById("emptyCartExploreBtn");
            if (exploreBtn) {
                exploreBtn.addEventListener("click", () => {
                    closeCart();
                    const prodSec = document.getElementById("produtos");
                    if (prodSec) prodSec.scrollIntoView({ behavior: "smooth" });
                });
            }
            if (cartFooter) cartFooter.style.display = "none";
            if (shippingProgressFill) shippingProgressFill.style.width = "0%";
            if (shippingBarText) shippingBarText.innerHTML = `Faltam ${formatCurrency(FREE_SHIPPING_THRESHOLD)} para <strong>FRETE GRÁTIS</strong>!`;
            return;
        }

        if (cartFooter) cartFooter.style.display = "block";

        // Renderizar lista de itens
        cartItemsList.innerHTML = cart.map((item, idx) => `
            <div class="cart-item" data-idx="${idx}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <span class="item-cat">${item.category}</span>
                    <h4 class="item-name">${item.name}</h4>
                    <span class="item-size">Tamanho: <strong>${item.size || "M"}</strong></span>
                    <strong class="item-price">${formatCurrency(item.price * item.qty)}</strong>
                    <div class="cart-item-controls">
                        <div class="qty-stepper">
                            <button type="button" class="btn-qty-minus" data-idx="${idx}">-</button>
                            <span>${item.qty}</span>
                            <button type="button" class="btn-qty-plus" data-idx="${idx}">+</button>
                        </div>
                    </div>
                </div>
                <button class="remove-item-btn" data-idx="${idx}" title="Remover item" aria-label="Remover">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `).join("");

        // Subtotal e Desconto
        const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
        let discount = 0;
        if (appliedCoupon === "GARDENIA10") {
            discount = subtotal * 0.10;
        }

        // Frete
        const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
        const shipping = isFreeShipping ? 0 : STANDARD_SHIPPING_FEE;
        const total = Math.max(0, subtotal - discount + shipping);

        // Barra de progresso de frete
        const progressPct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
        if (shippingProgressFill) shippingProgressFill.style.width = `${progressPct}%`;
        if (shippingBarText) {
            if (isFreeShipping) {
                shippingBarText.innerHTML = `🎉 Parabéns! Você ganhou <strong>FRETE GRÁTIS</strong>!`;
            } else {
                const diff = FREE_SHIPPING_THRESHOLD - subtotal;
                shippingBarText.innerHTML = `Faltam apenas <strong>${formatCurrency(diff)}</strong> para <strong>FRETE GRÁTIS</strong>!`;
            }
        }

        // Valores resumo
        if (cartSubtotalEl) cartSubtotalEl.textContent = formatCurrency(subtotal);
        if (discountRow && cartDiscountEl) {
            if (discount > 0) {
                discountRow.style.display = "flex";
                cartDiscountEl.textContent = `- ${formatCurrency(discount)}`;
            } else {
                discountRow.style.display = "none";
            }
        }
        if (cartShippingEl) {
            cartShippingEl.textContent = isFreeShipping ? "GRÁTIS" : formatCurrency(shipping);
            cartShippingEl.style.color = isFreeShipping ? "var(--color-success)" : "";
        }
        if (cartTotalEl) cartTotalEl.textContent = formatCurrency(total);

        // Adicionar eventos aos botões de quantidade e remoção
        document.querySelectorAll(".btn-qty-minus").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const i = parseInt(e.currentTarget.dataset.idx);
                if (cart[i].qty > 1) {
                    cart[i].qty--;
                } else {
                    cart.splice(i, 1);
                }
                saveCart();
                updateCartUI();
            });
        });

        document.querySelectorAll(".btn-qty-plus").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const i = parseInt(e.currentTarget.dataset.idx);
                cart[i].qty++;
                saveCart();
                updateCartUI();
            });
        });

        document.querySelectorAll(".remove-item-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const i = parseInt(e.currentTarget.dataset.idx);
                const removed = cart.splice(i, 1)[0];
                saveCart();
                updateCartUI();
                showToast(`"${removed.name}" removido da sacola.`);
            });
        });
    }

    function addToCart(productId, size = "M", qty = 1, openAfter = true) {
        const product = products.find(p => p.id === Number(productId));
        if (!product) return;

        const existingItem = cart.find(item => item.id === product.id && item.size === size);
        if (existingItem) {
            existingItem.qty += qty;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                category: product.category,
                price: product.price,
                image: product.image,
                size: size,
                qty: qty
            });
        }

        saveCart();
        updateCartUI();
        showToast(`✓ "${product.name}" (${size}) adicionado à sacola!`, "🛍");

        if (openAfter) {
            setTimeout(() => openCart(), 300);
        }
    }

    // Cupons
    if (applyCouponBtn && couponInput) {
        applyCouponBtn.addEventListener("click", () => {
            const code = couponInput.value.trim().toUpperCase();
            if (code === "GARDENIA10") {
                appliedCoupon = "GARDENIA10";
                localStorage.setItem("gardenia_coupon", appliedCoupon);
                couponMessage.textContent = "✓ Cupom de 10% OFF aplicado com sucesso!";
                couponMessage.className = "coupon-message success";
                updateCartUI();
                showToast("Cupom GARDENIA10 ativado! 10% de desconto adicionado.");
            } else if (!code) {
                couponMessage.textContent = "Digite um código de cupom.";
                couponMessage.className = "coupon-message error";
            } else {
                couponMessage.textContent = "Cupom inválido ou expirado.";
                couponMessage.className = "coupon-message error";
            }
        });
    }

    // =========================================================================
    // 6. GESTÃO DE FAVORITOS / WISHLIST
    // =========================================================================
    const wishlistBtn = document.getElementById("wishlistBtn");
    const wishlistDrawer = document.getElementById("wishlistDrawer");
    const wishlistOverlay = document.getElementById("wishlistOverlay");
    const closeWishlistBtn = document.getElementById("closeWishlistBtn");
    const wishlistCountEl = document.getElementById("wishlistCount");
    const wishlistDrawerCount = document.getElementById("wishlistDrawerCount");
    const wishlistItemsList = document.getElementById("wishlistItemsList");
    const clearWishlistBtn = document.getElementById("clearWishlistBtn");

    function openWishlist() {
        if (wishlistDrawer && wishlistOverlay) {
            wishlistDrawer.classList.add("open");
            wishlistOverlay.classList.add("active");
            wishlistDrawer.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
        }
    }

    function closeWishlist() {
        if (wishlistDrawer && wishlistOverlay) {
            wishlistDrawer.classList.remove("open");
            wishlistOverlay.classList.remove("active");
            wishlistDrawer.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        }
    }

    if (wishlistBtn) wishlistBtn.addEventListener("click", openWishlist);
    if (closeWishlistBtn) closeWishlistBtn.addEventListener("click", closeWishlist);
    if (wishlistOverlay) wishlistOverlay.addEventListener("click", closeWishlist);

    function updateWishlistUI() {
        const count = wishlist.length;
        if (wishlistCountEl) wishlistCountEl.textContent = count;
        if (wishlistDrawerCount) wishlistDrawerCount.textContent = `(${count} ${count === 1 ? "item" : "itens"})`;

        // Atualizar cor dos corações nos cards de produtos
        document.querySelectorAll(".heart-btn").forEach(btn => {
            const id = Number(btn.dataset.id);
            btn.classList.toggle("liked", wishlist.includes(id));
        });

        if (wishlist.length === 0) {
            wishlistItemsList.innerHTML = `
                <div class="empty-drawer-box">
                    <div class="empty-drawer-icon">♡</div>
                    <h4>Sua lista está vazia</h4>
                    <p>Salve suas peças favoritas para encontrá-las facilmente mais tarde.</p>
                </div>
            `;
            if (clearWishlistBtn) clearWishlistBtn.style.display = "none";
            return;
        }

        if (clearWishlistBtn) clearWishlistBtn.style.display = "block";

        const favoritedProducts = products.filter(p => wishlist.includes(p.id));
        wishlistItemsList.innerHTML = favoritedProducts.map(product => `
            <div class="wishlist-item" data-id="${product.id}">
                <img src="${product.image}" alt="${product.name}" class="wishlist-item-img">
                <div class="wishlist-item-details">
                    <span class="item-cat">${product.category}</span>
                    <h4 class="item-name">${product.name}</h4>
                    <strong class="item-price">${formatCurrency(product.price)}</strong>
                    <button class="primary-btn move-to-cart-btn" data-id="${product.id}" style="padding: 6px 12px; font-size: 0.7rem; margin-top: 6px;">
                        Mover para a Sacola →
                    </button>
                </div>
                <button class="remove-wishlist-item-btn" data-id="${product.id}" title="Remover dos favoritos">
                    ✕
                </button>
            </div>
        `).join("");

        // Eventos dos botões da lista de desejos
        document.querySelectorAll(".move-to-cart-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = Number(btn.dataset.id);
                addToCart(id, "M", 1, false);
                // Remover dos favoritos
                wishlist = wishlist.filter(itemId => itemId !== id);
                saveWishlist();
                updateWishlistUI();
                showToast("Item movido para a sua sacola de compras!", "🛍");
            });
        });

        document.querySelectorAll(".remove-wishlist-item-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = Number(btn.dataset.id);
                wishlist = wishlist.filter(itemId => itemId !== id);
                saveWishlist();
                updateWishlistUI();
                showToast("Item removido dos favoritos.");
            });
        });
    }

    function toggleWishlist(productId) {
        const id = Number(productId);
        const idx = wishlist.indexOf(id);
        const product = products.find(p => p.id === id);

        if (idx > -1) {
            wishlist.splice(idx, 1);
            showToast(`"${product ? product.name : "Item"}" removido dos favoritos.`);
        } else {
            wishlist.push(id);
            showToast(`♥ "${product ? product.name : "Item"}" adicionado aos favoritos!`, "♡");
        }
        saveWishlist();
        updateWishlistUI();
    }

    document.querySelectorAll(".heart-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleWishlist(btn.dataset.id);
        });
    });

    if (clearWishlistBtn) {
        clearWishlistBtn.addEventListener("click", () => {
            wishlist = [];
            saveWishlist();
            updateWishlistUI();
            showToast("Lista de desejos limpa.");
        });
    }

    // =========================================================================
    // 7. BUSCA RÁPIDA (QUICK SEARCH MODAL)
    // =========================================================================
    const searchBtn = document.getElementById("searchBtn");
    const searchPanel = document.getElementById("searchPanel");
    const closeSearch = document.getElementById("closeSearch");
    const searchInput = document.getElementById("searchInput");
    const searchResultsArea = document.getElementById("searchResultsArea");

    function openSearch() {
        if (searchPanel) {
            searchPanel.classList.add("open");
            searchPanel.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
            setTimeout(() => {
                if (searchInput) searchInput.focus();
            }, 100);
        }
    }

    function closeSearchModal() {
        if (searchPanel) {
            searchPanel.classList.remove("open");
            searchPanel.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        }
    }

    if (searchBtn) searchBtn.addEventListener("click", openSearch);
    if (closeSearch) closeSearch.addEventListener("click", closeSearchModal);

    function performSearch(term) {
        const query = term.toLowerCase().trim();
        if (!query) {
            searchResultsArea.innerHTML = `<div class="search-empty-hint">Digite o nome de uma peça ou selecione uma sugestão acima.</div>`;
            return;
        }

        const matches = products.filter(p => 
            p.name.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query) ||
            (p.gender && p.gender.toLowerCase().includes(query)) ||
            (p.description && p.description.toLowerCase().includes(query)) ||
            (p.tag && p.tag.toLowerCase().includes(query))
        );

        if (matches.length === 0) {
            searchResultsArea.innerHTML = `
                <div class="search-empty-hint">
                    Nenhum produto encontrado para "<strong>${term}</strong>".<br>
                    Experimente buscar por <em>Vestido, Linho, Blazer</em> ou <em>Casual</em>.
                </div>
            `;
            return;
        }

        searchResultsArea.innerHTML = matches.map(p => `
            <div class="search-card-item" data-id="${p.id}">
                <img src="${p.image}" alt="${p.name}" class="search-card-thumb">
                <div class="search-card-details">
                    <span>${p.category}</span>
                    <h4>${p.name}</h4>
                    <strong>${formatCurrency(p.price)}</strong>
                </div>
                <button class="search-card-btn" data-id="${p.id}">Ver Peça</button>
            </div>
        `).join("");

        // Clicar no resultado abre o Quick View do produto correspondente
        document.querySelectorAll(".search-card-item").forEach(card => {
            card.addEventListener("click", () => {
                const id = card.dataset.id;
                closeSearchModal();
                openQuickView(id);
            });
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            performSearch(e.target.value);
        });
    }

    // Chips de buscas frequentes
    document.querySelectorAll(".search-tag-chip").forEach(chip => {
        chip.addEventListener("click", () => {
            const val = chip.dataset.search;
            if (searchInput) {
                searchInput.value = val;
                performSearch(val);
            }
        });
    });

    // =========================================================================
    // 8. MODAL DE DETALHES RÁPIDOS (QUICK VIEW)
    // =========================================================================
    const quickViewModal = document.getElementById("quickViewModal");
    const quickViewOverlay = document.getElementById("quickViewOverlay");
    const closeQuickViewBtn = document.getElementById("closeQuickViewBtn");

    const modalProductImg = document.getElementById("modalProductImg");
    const modalProductTag = document.getElementById("modalProductTag");
    const modalProductCategory = document.getElementById("modalProductCategory");
    const modalProductName = document.getElementById("modalProductName");
    const modalProductRating = document.getElementById("modalProductRating");
    const modalProductReviews = document.getElementById("modalProductReviews");
    const modalProductPrice = document.getElementById("modalProductPrice");
    const modalProductOldPrice = document.getElementById("modalProductOldPrice");
    const modalProductDesc = document.getElementById("modalProductDesc");
    const modalProductComposition = document.getElementById("modalProductComposition");
    const modalSizeOptions = document.getElementById("modalSizeOptions");
    const modalQtyMinus = document.getElementById("modalQtyMinus");
    const modalQtyPlus = document.getElementById("modalQtyPlus");
    const modalQtyVal = document.getElementById("modalQtyVal");
    const modalAddToCartBtn = document.getElementById("modalAddToCartBtn");
    const inlineSizeGuideBtn = document.getElementById("inlineSizeGuideBtn");

    let currentModalProduct = null;
    let selectedSize = "M";
    let modalQuantity = 1;

    function openQuickView(productId) {
        const product = products.find(p => p.id === Number(productId));
        if (!product) return;

        currentModalProduct = product;
        modalQuantity = 1;
        if (modalQtyVal) modalQtyVal.textContent = "1";

        modalProductImg.src = product.image;
        modalProductImg.alt = product.name;
        
        if (product.tag) {
            modalProductTag.style.display = "block";
            modalProductTag.textContent = product.tag;
        } else {
            modalProductTag.style.display = "none";
        }

        modalProductCategory.textContent = product.category;
        modalProductName.textContent = product.name;
        modalProductRating.textContent = product.rating || "5.0";
        modalProductReviews.textContent = `(${product.reviews_count || 24} avaliações)`;
        modalProductPrice.textContent = formatCurrency(product.price);
        
        if (product.old_price) {
            modalProductOldPrice.style.display = "inline";
            modalProductOldPrice.textContent = formatCurrency(product.old_price);
        } else {
            modalProductOldPrice.style.display = "none";
        }

        modalProductDesc.textContent = product.description || "Peça com corte contemporâneo e caimento anatômico perfeito.";
        modalProductComposition.textContent = product.composition || "Fibras Naturais Selecionadas";

        // Gerar tamanhos
        const sizes = product.sizes || ["PP", "P", "M", "G", "GG"];
        selectedSize = sizes[0] || "M";

        modalSizeOptions.innerHTML = sizes.map((s, idx) => `
            <button type="button" class="size-btn-pill ${idx === 0 ? "active" : ""}" data-size="${s}">
                ${s}
            </button>
        `).join("");

        modalSizeOptions.querySelectorAll(".size-btn-pill").forEach(btn => {
            btn.addEventListener("click", () => {
                modalSizeOptions.querySelectorAll(".size-btn-pill").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                selectedSize = btn.dataset.size;
            });
        });

        quickViewModal.classList.add("open");
        quickViewOverlay.classList.add("active");
        quickViewModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function closeQuickView() {
        if (quickViewModal && quickViewOverlay) {
            quickViewModal.classList.remove("open");
            quickViewOverlay.classList.remove("active");
            quickViewModal.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        }
    }

    if (closeQuickViewBtn) closeQuickViewBtn.addEventListener("click", closeQuickView);
    if (quickViewOverlay) quickViewOverlay.addEventListener("click", closeQuickView);

    if (modalQtyMinus && modalQtyPlus && modalQtyVal) {
        modalQtyMinus.addEventListener("click", () => {
            if (modalQuantity > 1) {
                modalQuantity--;
                modalQtyVal.textContent = modalQuantity;
            }
        });
        modalQtyPlus.addEventListener("click", () => {
            modalQuantity++;
            modalQtyVal.textContent = modalQuantity;
        });
    }

    if (modalAddToCartBtn) {
        modalAddToCartBtn.addEventListener("click", () => {
            if (currentModalProduct) {
                addToCart(currentModalProduct.id, selectedSize, modalQuantity, true);
                closeQuickView();
            }
        });
    }

    // =========================================================================
    // 9. INICIALIZAÇÃO DO GRID & EVENTOS DOS PRODUTOS
    // =========================================================================
    function initProductGrid() {
        const productGrid = document.getElementById("productGrid");
        if (!productGrid) return;

        // Se a página foi aberta diretamente como arquivo HTML sem o Flask
        if (productGrid.innerHTML.includes("{%") || productGrid.children.length === 0) {
            productGrid.innerHTML = products.map(product => `
                <article class="product-card reveal visible" data-id="${product.id}" data-gender="${product.gender || "Feminino"}" data-category="${product.category}" data-name="${product.name}">
                    <div class="product-image-container">
                        <img src="${product.image}" alt="${product.name}" loading="lazy" class="product-thumb">
                        ${product.tag ? `<span class="product-badge">${product.tag}</span>` : ""}
                        <button class="heart-btn ${wishlist.includes(product.id) ? "liked" : ""}" data-id="${product.id}" aria-label="Adicionar aos favoritos" title="Favoritar">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </button>
                        <div class="product-actions-overlay">
                            <button class="quick-view-btn" data-id="${product.id}">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                Olhar Rápido
                            </button>
                            <button class="add-to-cart-btn" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                Adicionar à Sacola
                            </button>
                        </div>
                    </div>
                    <div class="product-meta">
                        <div class="product-meta-header">
                            <span class="product-cat">${product.category} • ${product.gender || "Feminino"}</span>
                            <div class="product-rating">
                                <span class="stars">★</span>
                                <span class="rating-num">${product.rating || "5.0"}</span>
                            </div>
                        </div>
                        <h3 class="product-title">${product.name}</h3>
                        <div class="product-price-box">
                            ${product.old_price ? `<span class="old-price">${formatCurrency(product.old_price)}</span>` : ""}
                            <strong class="current-price">${formatCurrency(product.price)}</strong>
                        </div>
                    </div>
                </article>
            `).join("");
        }

        // Botões Adicionar à Sacola nos cards
        document.querySelectorAll(".add-to-cart-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const originalContent = btn.innerHTML;
                btn.innerHTML = `<span>✓ Adicionado</span>`;
                addToCart(id, "M", 1, true);
                setTimeout(() => btn.innerHTML = originalContent, 1400);
            });
        });

        // Botões Favoritar (Coração) nos cards
        document.querySelectorAll(".heart-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                toggleWishlist(btn.dataset.id);
            });
        });

        // Botões Olhar Rápido
        document.querySelectorAll(".quick-view-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                openQuickView(btn.dataset.id);
            });
        });

        // Clique na imagem do produto para abrir detalhes
        document.querySelectorAll(".product-image-container").forEach(box => {
            box.addEventListener("click", (e) => {
                if (e.target.closest(".heart-btn") || e.target.closest(".add-to-cart-btn") || e.target.closest(".quick-view-btn")) return;
                const card = box.closest(".product-card");
                if (card) openQuickView(card.dataset.id);
            });
        });
    }

    // =========================================================================
    // 10. DEPARTAMENTOS & FILTROS DE CATEGORIA (FEMININO / MASCULINO / TODOS)
    // =========================================================================
    let currentDept = "Feminino";
    let currentCategory = "Todos";

    const DEPT_CATEGORIES = {
        "Feminino": ["Todos", "Vestidos", "Básicos", "Alfaiataria", "Malhas", "Casual"],
        "Masculino": ["Todos", "Camisas", "Alfaiataria", "Básicos", "Malhas", "Casual"],
        "Todos": ["Todos", "Vestidos", "Camisas", "Alfaiataria", "Básicos", "Malhas", "Casual"]
    };

    const emptyProducts = document.getElementById("emptyProducts");
    const resetFilterBtn = document.getElementById("resetFilterBtn");

    function renderCategoryFilters(dept) {
        const filtersContainer = document.getElementById("filters");
        if (!filtersContainer) return;

        const categories = DEPT_CATEGORIES[dept] || DEPT_CATEGORIES["Todos"];
        filtersContainer.innerHTML = categories.map(cat => `
            <button class="filter ${cat === currentCategory ? "active" : ""}" data-filter="${cat}">
                ${cat === "Todos" ? "Todas as Categorias" : cat}
            </button>
        `).join("");

        filtersContainer.querySelectorAll(".filter").forEach(btn => {
            btn.addEventListener("click", () => {
                currentCategory = btn.dataset.filter;
                filtersContainer.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                filterProducts();
            });
        });
    }

    function filterProducts() {
        const cards = document.querySelectorAll(".product-card");
        let visibleCount = 0;

        cards.forEach(card => {
            const cardGender = card.dataset.gender || "Feminino";
            const matchDept = (currentDept === "Todos" || cardGender === currentDept);
            const matchCat = (currentCategory === "Todos" || card.dataset.category === currentCategory);
            const isVisible = matchDept && matchCat;

            card.classList.toggle("hidden", !isVisible);
            if (isVisible) visibleCount++;
        });

        if (emptyProducts) {
            emptyProducts.style.display = (visibleCount === 0) ? "block" : "none";
        }
    }

    function setDepartment(dept) {
        currentDept = dept;
        currentCategory = "Todos";

        // Atualizar abas
        document.querySelectorAll(".dept-tab").forEach(tab => {
            const isActive = tab.dataset.dept === dept;
            tab.classList.toggle("active", isActive);
            tab.setAttribute("aria-selected", isActive ? "true" : "false");
        });

        renderCategoryFilters(dept);
        filterProducts();
    }

    // Cliques nas abas de departamento
    document.querySelectorAll(".dept-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            setDepartment(tab.dataset.dept);
        });
    });

    // Cliques nos links da navbar "Feminino" e "Masculino"
    document.querySelectorAll(".nav-dept-link").forEach(link => {
        link.addEventListener("click", (e) => {
            const dept = link.dataset.dept;
            if (dept) {
                setDepartment(dept);
                showToast(`Exibindo Coleção ${dept}`, dept === "Feminino" ? "♀" : "♂");
            }
        });
    });

    if (resetFilterBtn) {
        resetFilterBtn.addEventListener("click", () => {
            setDepartment("Todos");
        });
    }

    // Cliques nos botões de Coleções ("Descobrir Peças" / "Ver todas as peças")
    document.querySelectorAll(".collection-card, .collection-link-btn").forEach(el => {
        el.addEventListener("click", (e) => {
            const cat = el.dataset.category;
            if (cat) {
                setDepartment("Todos");
                currentCategory = cat;
                renderCategoryFilters("Todos");
                filterProducts();
                const prodSec = document.getElementById("produtos");
                if (prodSec) prodSec.scrollIntoView({ behavior: "smooth" });
            }
        });
    });

    const viewAllCollectionsBtn = document.getElementById("viewAllCollectionsBtn");
    if (viewAllCollectionsBtn) {
        viewAllCollectionsBtn.addEventListener("click", () => {
            setDepartment("Todos");
            const prodSec = document.getElementById("produtos");
            if (prodSec) prodSec.scrollIntoView({ behavior: "smooth" });
        });
    }

    // =========================================================================
    // 10. PERSONAL STYLIST VIRTUAL QUIZ
    // =========================================================================
    const styleButtons = document.querySelectorAll(".style-btn");
    const styleResultTitle = document.getElementById("styleResultTitle");
    const styleResultText = document.getElementById("styleResultText");
    const styleFilterActionBtn = document.getElementById("styleFilterActionBtn");

    styleButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            styleButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const styleName = btn.dataset.style;
            const desc = btn.dataset.desc;
            const cat = btn.dataset.cat;

            if (styleResultTitle) styleResultTitle.textContent = `Estilo ${styleName}`;
            if (styleResultText) styleResultText.textContent = desc;
            if (styleFilterActionBtn) {
                styleFilterActionBtn.textContent = `Ver Peças de ${cat} →`;
                styleFilterActionBtn.dataset.target = cat;
            }
        });
    });

    if (styleFilterActionBtn) {
        styleFilterActionBtn.addEventListener("click", () => {
            const targetCat = styleFilterActionBtn.dataset.target || "Todos";
            applyFilter(targetCat);
            const prodSec = document.getElementById("produtos");
            if (prodSec) prodSec.scrollIntoView({ behavior: "smooth" });
            showToast(`Filtrando seleção para ${targetCat}.`);
        });
    }

    // =========================================================================
    // 11. MODAIS INFORMATIVOS (GUIA DE MEDIDAS & TROCAS & POLÍTICAS)
    // =========================================================================
    const measureModal = document.getElementById("measureModal");
    const measureOverlay = document.getElementById("measureOverlay");
    const closeMeasureBtn = document.getElementById("closeMeasureBtn");
    const openMeasurementGuideBtn = document.getElementById("openMeasurementGuideBtn");
    const footerMeasureBtn = document.getElementById("footerMeasureBtn");

    function openMeasureModal() {
        if (measureModal && measureOverlay) {
            measureModal.classList.add("open");
            measureOverlay.classList.add("active");
            measureModal.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
        }
    }

    function closeMeasureModal() {
        if (measureModal && measureOverlay) {
            measureModal.classList.remove("open");
            measureOverlay.classList.remove("active");
            measureModal.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        }
    }

    if (openMeasurementGuideBtn) openMeasurementGuideBtn.addEventListener("click", openMeasureModal);
    if (footerMeasureBtn) footerMeasureBtn.addEventListener("click", openMeasureModal);
    if (inlineSizeGuideBtn) inlineSizeGuideBtn.addEventListener("click", () => {
        closeQuickView();
        openMeasureModal();
    });
    if (closeMeasureBtn) closeMeasureBtn.addEventListener("click", closeMeasureModal);
    if (measureOverlay) measureOverlay.addEventListener("click", closeMeasureModal);

    // Modal de Trocas
    const returnsModal = document.getElementById("returnsModal");
    const returnsOverlay = document.getElementById("returnsOverlay");
    const closeReturnsBtn = document.getElementById("closeReturnsBtn");
    const openReturnsPolicyBtn = document.getElementById("openReturnsPolicyBtn");
    const footerReturnsBtn = document.getElementById("footerReturnsBtn");

    function openReturnsModal() {
        if (returnsModal && returnsOverlay) {
            returnsModal.classList.add("open");
            returnsOverlay.classList.add("active");
            returnsModal.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
        }
    }

    function closeReturnsModal() {
        if (returnsModal && returnsOverlay) {
            returnsModal.classList.remove("open");
            returnsOverlay.classList.remove("active");
            returnsModal.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        }
    }

    if (openReturnsPolicyBtn) openReturnsPolicyBtn.addEventListener("click", openReturnsModal);
    if (footerReturnsBtn) footerReturnsBtn.addEventListener("click", openReturnsModal);
    if (closeReturnsBtn) closeReturnsBtn.addEventListener("click", closeReturnsModal);
    if (returnsOverlay) returnsOverlay.addEventListener("click", closeReturnsModal);

    const footerFaqBtn = document.getElementById("footerFaqBtn");
    if (footerFaqBtn) {
        footerFaqBtn.addEventListener("click", () => {
            showToast("Para dúvidas frequentes ou atendimento humano, chame nosso ateliê pelo WhatsApp!", "🌿");
        });
    }

    // =========================================================================
    // 12. CHECKOUT & FINALIZAÇÃO DE PEDIDOS
    // =========================================================================
    const checkoutModal = document.getElementById("checkoutModal");
    const checkoutOverlay = document.getElementById("checkoutOverlay");
    const closeCheckoutBtn = document.getElementById("closeCheckoutBtn");
    const startCheckoutBtn = document.getElementById("startCheckoutBtn");
    const checkoutForm = document.getElementById("checkoutForm");
    const checkoutItemsSummary = document.getElementById("checkoutItemsSummary");
    const checkoutTotals = document.getElementById("checkoutTotals");

    function openCheckout() {
        if (cart.length === 0) {
            showToast("Adicione ao menos uma peça à sua sacola para finalizar.", "⚠️");
            return;
        }

        closeCart();

        // Renderizar resumo de itens
        if (checkoutItemsSummary) {
            checkoutItemsSummary.innerHTML = cart.map(item => `
                <div class="checkout-summary-row">
                    <span>${item.qty}x ${item.name} (${item.size || "M"})</span>
                    <strong>${formatCurrency(item.price * item.qty)}</strong>
                </div>
            `).join("");
        }

        const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
        const discount = (appliedCoupon === "GARDENIA10") ? subtotal * 0.10 : 0;
        const shipping = (subtotal >= FREE_SHIPPING_THRESHOLD) ? 0 : STANDARD_SHIPPING_FEE;
        const total = Math.max(0, subtotal - discount + shipping);

        if (checkoutTotals) {
            checkoutTotals.innerHTML = `
                <div class="summary-line" style="margin-top: 10px;">
                    <span>Subtotal:</span>
                    <span>${formatCurrency(subtotal)}</span>
                </div>
                ${discount > 0 ? `
                <div class="summary-line discount-line">
                    <span>Desconto (GARDENIA10):</span>
                    <span>- ${formatCurrency(discount)}</span>
                </div>` : ""}
                <div class="summary-line">
                    <span>Frete:</span>
                    <span>${shipping === 0 ? "GRÁTIS" : formatCurrency(shipping)}</span>
                </div>
                <div class="summary-line total-line" style="font-size: 1.25rem; font-weight: 700; margin-top: 8px;">
                    <span>Total Final:</span>
                    <strong>${formatCurrency(total)}</strong>
                </div>
            `;
        }

        if (checkoutModal && checkoutOverlay) {
            checkoutModal.classList.add("open");
            checkoutOverlay.classList.add("active");
            checkoutModal.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
        }
    }

    function closeCheckout() {
        if (checkoutModal && checkoutOverlay) {
            checkoutModal.classList.remove("open");
            checkoutOverlay.classList.remove("active");
            checkoutModal.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        }
    }

    if (startCheckoutBtn) startCheckoutBtn.addEventListener("click", openCheckout);
    if (closeCheckoutBtn) closeCheckoutBtn.addEventListener("click", closeCheckout);
    if (checkoutOverlay) checkoutOverlay.addEventListener("click", closeCheckout);

    if (checkoutForm) {
        checkoutForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("checkoutName").value.trim();
            const phone = document.getElementById("checkoutPhone").value.trim();
            const city = document.getElementById("checkoutCity").value.trim();
            const address = document.getElementById("checkoutAddress").value.trim();
            const payment = document.querySelector('input[name="paymentMethod"]:checked')?.value || "PIX";

            const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
            const discount = (appliedCoupon === "GARDENIA10") ? subtotal * 0.10 : 0;
            const shipping = (subtotal >= FREE_SHIPPING_THRESHOLD) ? 0 : STANDARD_SHIPPING_FEE;
            const total = Math.max(0, subtotal - discount + shipping);

            const itemsText = cart.map(item => `• ${item.qty}x ${item.name} (${item.size}) - ${formatCurrency(item.price * item.qty)}`).join("%0A");
            
            const message = `*NOVO PEDIDO GARDÊNIA*%0A%0A` +
                `*Cliente:* ${name}%0A` +
                `*WhatsApp:* ${phone}%0A` +
                `*Entrega:* ${address}, ${city}%0A` +
                `*Pagamento:* ${payment}%0A%0A` +
                `*Itens:*%0A${itemsText}%0A%0A` +
                `*Total:* ${formatCurrency(total)}%0A%0A` +
                `Por favor, me informe a chave PIX ou o link seguro de pagamento!`;

            closeCheckout();
            
            // Limpa o carrinho
            cart = [];
            saveCart();
            updateCartUI();

            showToast(`Obrigada, ${name}! Pedido gerado com sucesso. Redirecionando para atendimento...`, "✨");

            // Abre o WhatsApp com a mensagem formatada
            setTimeout(() => {
                const whatsappUrl = `https://wa.me/5511999999999?text=${message}`;
                window.open(whatsappUrl, "_blank");
            }, 1200);
        });
    }

    // =========================================================================
    // 13. NEWSLETTER
    // =========================================================================
    const newsletterForm = document.getElementById("newsletterForm");
    const newsletterFeedback = document.getElementById("newsletterFeedback");
    const newsletterEmail = document.getElementById("newsletterEmail");

    if (newsletterForm) {
        newsletterForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = newsletterEmail.value.trim();
            if (email) {
                if (newsletterFeedback) {
                    newsletterFeedback.innerHTML = `✓ Bem-vinda ao círculo Gardênia! Use o cupom <strong>GARDENIA10</strong> para 10% OFF.`;
                    newsletterFeedback.style.color = "#d6e2cf";
                }
                showToast("Inscrição confirmada! Seu cupom de 10% é GARDENIA10", "🎉");
                newsletterForm.reset();
            }
        });
    }

    // Tecla ESC fecha qualquer modal ou gaveta aberta
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeCart();
            closeWishlist();
            closeSearchModal();
            closeQuickView();
            closeMeasureModal();
            closeReturnsModal();
            closeCheckout();
        }
    });

    // =========================================================================
    // 14. INICIALIZAÇÃO DE ESTADO
    // =========================================================================
    initProductGrid();
    setDepartment("Feminino");
    updateCartUI();
    updateWishlistUI();
});

