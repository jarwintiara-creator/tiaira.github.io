// Import Firebase SDK via CDN (Modular v10+)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updateProfile 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ==========================================
// 1. KONFIGURASI PENTING
// ==========================================

// Nomor WhatsApp Tujuan Pemesanan
const NOMOR_WHATSAPP = "6281241761437";

// Konfigurasi Firebase (Ganti placeholder ini sesuai proyek Firebase Anda)
const firebaseConfig = {
    apiKey: "ISI_DENGAN_API_KEY_ANDA",
    authDomain: "ISI_DENGAN_AUTH_DOMAIN_ANDA",
    projectId: "ISI_DENGAN_PROJECT_ID_ANDA",
    storageBucket: "ISI_DENGAN_STORAGE_BUCKET_ANDA",
    messagingSenderId: "ISI_DENGAN_MESSAGING_SENDER_ID_ANDA",
    appId: "ISI_DENGAN_APP_ID_ANDA"
};

// Inisialisasi Firebase Auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ==========================================
// 2. DATA PRODUK KATALOG
// ==========================================
const products = [
    {
        id: 1,
        name: "Gamis Silk Elegan Rose",
        category: "Pakaian",
        price: 285000,
        description: "Gamis bahan sutra premium lembut dan nyaman.",
        variants: ["S", "M", "L", "XL"],
        image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 2,
        name: "Tas Tangan Kulit Minimalis",
        category: "Tas",
        price: 340000,
        description: "Tas selempang wanita bahan sintetis kulit sintetis kelas A.",
        variants: ["Hitam", "Krem", "Cokelat"],
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 3,
        name: "Sepatu Heels Velvet Soft",
        category: "Sepatu",
        price: 220000,
        description: "Heels 5cm berbahan velvet tinggi tingkat kenyamanan ekstra.",
        variants: ["37", "38", "39", "40"],
        image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 4,
        name: "Glow Serum Vitamin C",
        category: "Skincare",
        price: 125000,
        description: "Mencerahkan kulit wajah dan menyamarkan noda hitam.",
        variants: ["30ml"],
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 5,
        name: "Matte Lip Cream Rosewood",
        category: "Makeup",
        price: 75000,
        description: "Lip cream formula tahan lama hingga 12 jam tidak kering.",
        variants: ["01 Nude", "02 Pink", "03 Red Rose"],
        image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 6,
        name: "Eau De Parfum Vanilla Bloom",
        category: "Parfum",
        price: 195000,
        description: "Aroma lembut manis vanilla paduan bunga manis feminin.",
        variants: ["50ml", "100ml"],
        image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 7,
        name: "Kalung Mutiara Elegant Layer",
        category: "Aksesori",
        price: 95000,
        description: "Kalung aksesoris wanita gaya modern dan anggun.",
        variants: ["Gold", "Silver"],
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=500&q=80"
    }
];

// State Aplikasi
let cart = [];
let currentUser = null;

// ==========================================
// 3. UTILITAS KEAMANAN & FORMATTING
// ==========================================

// Escape string untuk cegah Vulnerability Cross-Site Scripting (XSS)
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Format Angka ke Rupiah
function formatRupiah(number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(number);
}

// ==========================================
// 4. RENDER KATALOG & FILTERING
// ==========================================
const productGrid = document.getElementById("product-grid");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const sortFilter = document.getElementById("sort-filter");

function renderProducts() {
    const query = searchInput.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;
    const selectedSort = sortFilter.value;

    let filtered = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query);
        const matchCategory = selectedCategory === "all" || p.category === selectedCategory;
        return matchSearch && matchCategory;
    });

    if (selectedSort === "low-high") {
        filtered.sort((a, b) => a.price - b.price);
    } else if (selectedSort === "high-low") {
        filtered.sort((a, b) => b.price - a.price);
    }

    productGrid.innerHTML = "";

    if (filtered.length === 0) {
        productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Produk tidak ditemukan.</p>`;
        return;
    }

    filtered.forEach(p => {
        const card = document.createElement("div");
        card.className = "product-card";

        let variantOptions = "";
        if (p.variants && p.variants.length > 0) {
            variantOptions = `<select class="variant-select" id="variant-${p.id}">
                ${p.variants.map(v => `<option value="${escapeHTML(v)}">${escapeHTML(v)}</option>`).join('')}
            </select>`;
        }

        card.innerHTML = `
            <img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}" class="product-image" loading="lazy">
            <div class="product-info">
                <span class="product-category">${escapeHTML(p.category)}</span>
                <h3 class="product-title">${escapeHTML(p.name)}</h3>
                <p class="product-description">${escapeHTML(p.description)}</p>
                <div class="product-price">${formatRupiah(p.price)}</div>
                ${variantOptions}
                <button class="btn-primary add-to-cart-btn" data-id="${p.id}">+ Keranjang</button>
            </div>
        `;
        productGrid.appendChild(card);
    });

    // Pasang Event Listener Tombol Keranjang
    document.querySelectorAll(".add-to-cart-btn").forEach(button => {
        button.addEventListener("click", (e) => {
            const productId = parseInt(e.target.getAttribute("data-id"));
            addToCart(productId);
        });
    });
}

// Event handler pencarian dan filter
searchInput.addEventListener("input", renderProducts);
categoryFilter.addEventListener("change", renderProducts);
sortFilter.addEventListener("change", renderProducts);

// ==========================================
// 5. KELOLA KERANJANG BELANJA
// ==========================================
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    let selectedVariant = "-";
    const variantSelect = document.getElementById(`variant-${productId}`);
    if (variantSelect) {
        selectedVariant = variantSelect.value;
    }

    const existingIndex = cart.findIndex(item => item.id === productId && item.variant === selectedVariant);

    if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            variant: selectedVariant,
            qty: 1
        });
    }

    updateCartUI();
}

function updateCartUI() {
    const cartCount = document.getElementById("cart-count");
    const cartItemsList = document.getElementById("cart-items");
    const cartTotalPrice = document.getElementById("cart-total-price");

    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCount.textContent = totalItems;

    cartItemsList.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
        cartItemsList.innerHTML = `<p style="text-align: center; color: var(--text-muted);">Keranjang belanja kosong.</p>`;
    } else {
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.qty;
            total += itemTotal;

            const div = document.createElement("div");
            div.className = "cart-item";
            div.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-title">${escapeHTML(item.name)}</div>
                    <div class="cart-item-sub">Varian: ${escapeHTML(item.variant)} | ${formatRupiah(item.price)}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="btn-qty-minus" data-index="${index}">-</button>
                    <span>${item.qty}</span>
                    <button class="btn-qty-plus" data-index="${index}">+</button>
                    <button class="btn-delete" data-index="${index}" style="color: var(--danger-color); margin-left:8px; border:none; background:none; cursor:pointer;">🗑️</button>
                </div>
            `;
            cartItemsList.appendChild(div);
        });
    }

    cartTotalPrice.textContent = formatRupiah(total);

    // Event listener aksi keranjang
    document.querySelectorAll(".btn-qty-minus").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const idx = parseInt(e.target.getAttribute("data-index"));
            if (cart[idx].qty > 1) {
                cart[idx].qty--;
            } else {
                cart.splice(idx, 1);
            }
            updateCartUI();
        });
    });

    document.querySelectorAll(".btn-qty-plus").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const idx = parseInt(e.target.getAttribute("data-index"));
            cart[idx].qty++;
            updateCartUI();
        });
    });

    document.querySelectorAll(".btn-delete").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const idx = parseInt(e.target.getAttribute("data-index"));
            cart.splice(idx, 1);
            updateCartUI();
        });
    });
}

// Modal Keranjang Handling
const cartModal = document.getElementById("cart-modal");
document.getElementById("btn-cart").addEventListener("click", () => {
    cartModal.classList.remove("hidden");
});
document.getElementById("close-cart-modal").addEventListener("click", () => {
    cartModal.classList.add("hidden");
});

// ==========================================
// 6. INTEGRASI WHATSAPP CHECKOUT
// ==========================================
document.getElementById("btn-checkout-wa").addEventListener("click", () => {
    // Validasi Login
    if (!currentUser) {
        alert("Silakan login terlebih dahulu untuk melakukan pemesanan!");
        cartModal.classList.add("hidden");
        document.getElementById("auth-modal").classList.remove("hidden");
        return;
    }

    if (cart.length === 0) {
        alert("Keranjang belanja Anda masih kosong!");
        return;
    }

    const address = document.getElementById("shipping-address").value.trim();
    const userName = currentUser.displayName || currentUser.email;

    // Format Pesan WhatsApp
    let message = `Halo TIAIRA FASHBEAUTY, saya ingin memesan produk berikut:\n\n`;
    message += `👤 *Pelanggan*: ${userName} (${currentUser.email})\n`;
    message += `-----------------------------------------\n`;

    let total = 0;
    cart.forEach((item, i) => {
        const subtotal = item.price * item.qty;
        total += subtotal;
        message += `${i + 1}. *${item.name}*\n`;
        message += `   Varian: ${item.variant}\n`;
        message += `   Jumlah: ${item.qty} x ${formatRupiah(item.price)} = ${formatRupiah(subtotal)}\n`;
    });

    message += `-----------------------------------------\n`;
    message += `💰 *Total Harga*: ${formatRupiah(total)}\n\n`;
    message += `📍 *Alamat Pengiriman*:\n${address ? address : '[Silakan isi alamat pengiriman di sini]'}\n\n`;
    message += `Mohon diinformasikan nomor rekening pembayaran & estimasi ongkir. Terima kasih!`;

    // Direct WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/${NOMOR_WHATSAPP}?text=${encodedMessage}`;
    window.open(waUrl, "_blank");
});

// ==========================================
// 7. FIREBASE AUTHENTICATION LOGIC
// ==========================================
const authModal = document.getElementById("auth-modal");
const btnOpenAuth = document.getElementById("btn-open-auth");
const closeAuthModal = document.getElementById("close-auth-modal");

const tabLoginBtn = document.getElementById("tab-login-btn");
const tabRegisterBtn = document.getElementById("tab-register-btn");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

const userInfo = document.getElementById("user-info");
const userDisplayName = document.getElementById("user-display-name");
const btnLogout = document.getElementById("btn-logout");

// Modal Auth Trigger
btnOpenAuth.addEventListener("click", () => authModal.classList.remove("hidden"));
closeAuthModal.addEventListener("click", () => authModal.classList.add("hidden"));

// Switch Tab Login & Register
tabLoginBtn.addEventListener("click", () => {
    tabLoginBtn.classList.add("active");
    tabRegisterBtn.classList.remove("active");
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
});

tabRegisterBtn.addEventListener("click", () => {
    tabRegisterBtn.classList.add("active");
    tabLoginBtn.classList.remove("active");
    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
});

// Error Handling Bahasa Indonesia
function getAuthErrorMessage(code) {
    switch (code) {
        case 'auth/email-already-in-use':
            return 'Email ini sudah terdaftar. Silakan login.';
        case 'auth/invalid-email':
            return 'Format email tidak valid.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'Email atau kata sandi salah.';
        case 'auth/weak-password':
            return 'Kata sandi terlalu lemah (minimal 6-8 karakter).';
        default:
            return 'Terjadi kesalahan. Silakan coba lagi.';
    }
}

// Process Form Registration
registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;
    const errorDiv = document.getElementById("register-error");

    errorDiv.textContent = "";

    if (password.length < 8) {
        errorDiv.textContent = "Kata sandi minimal harus 8 karakter.";
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        alert("Pendaftaran berhasil! Anda sudah masuk.");
        authModal.classList.add("hidden");
        registerForm.reset();
    } catch (error) {
        errorDiv.textContent = getAuthErrorMessage(error.code);
    }
});

// Process Form Login
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const errorDiv = document.getElementById("login-error");

    errorDiv.textContent = "";

    if (password.length < 8) {
        errorDiv.textContent = "Kata sandi minimal 8 karakter.";
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Login berhasil!");
        authModal.classList.add("hidden");
        loginForm.reset();
    } catch (error) {
        errorDiv.textContent = getAuthErrorMessage(error.code);
    }
});

// Logout User
btnLogout.addEventListener("click", () => {
    signOut(auth).then(() => {
        alert("Anda telah berhasil keluar.");
    });
});

// Auth Listener Observer
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        userDisplayName.textContent = user.displayName || user.email;
        userInfo.classList.remove("hidden");
        btnOpenAuth.classList.add("hidden");
    } else {
        userInfo.classList.add("hidden");
        btnOpenAuth.classList.remove("hidden");
    }
});

// Initial Render
renderProducts();
