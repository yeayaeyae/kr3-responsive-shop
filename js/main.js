/* КР3: адаптивность и доступность исходного TechStore. */
const menuButton = document.querySelector('.nav-toggle');
const navigation = document.querySelector('#main-nav');
const desktopMenu = matchMedia('(min-width: 768px)');
function setMenu(open, restoreFocus = false) {
    navigation?.classList.toggle('is-open', open);
    menuButton?.setAttribute('aria-expanded', String(open));
    if (restoreFocus) menuButton?.focus();
}
menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
navigation?.addEventListener('click', event => {
    if (event.target.closest('a') && !desktopMenu.matches) setMenu(false);
});
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !desktopMenu.matches && menuButton?.getAttribute('aria-expanded') === 'true') setMenu(false, true);
});
document.addEventListener('click', event => {
    if (!event.target.closest('.header') && !desktopMenu.matches) setMenu(false);
});
desktopMenu.addEventListener('change', () => {
    const focusInMenu = navigation?.contains(document.activeElement);
    setMenu(false, !desktopMenu.matches && focusInMenu);
});

const catalog = document.querySelector('.catalog-filter');
const filterButton = document.querySelector('.filter-toggle');
const wideCatalog = matchMedia('(min-width: 1024px)');
function setFilters(open) {
    catalog?.classList.toggle('is-open', open);
    filterButton?.setAttribute('aria-expanded', String(open));
    if (filterButton) filterButton.textContent = open ? 'Скрыть фильтры' : 'Показать фильтры';
}
filterButton?.addEventListener('click', () => setFilters(filterButton.getAttribute('aria-expanded') !== 'true'));
wideCatalog.addEventListener('change', () => {
    const focused = document.querySelector('.filter-body')?.contains(document.activeElement);
    setFilters(wideCatalog.matches);
    if (!wideCatalog.matches && focused) filterButton?.focus();
});
if (catalog) {
    setFilters(wideCatalog.matches);
    const categories = [...catalog.querySelectorAll('input[name="category"]')];
    const prices = [...catalog.querySelectorAll('input[name="price"]')];
    const records = [...document.querySelectorAll('.catalog__content .product-card')].map(card => ({
        card, category: card.querySelector('.product-card__category').textContent.trim(),
        price: Number(card.querySelector('.product-card__price').textContent.replace(/\D/g, ''))
    }));
    function updateCatalog() {
        const selected = categories.filter(input => input.checked).map(input => input.value);
        const price = prices.find(input => input.checked)?.value || 'all';
        let count = 0;
        for (const record of records) {
            const categoryMatch = selected.includes('all') || selected.includes(record.category);
            const priceMatch = price === 'all' || (price === 'low' && record.price < 20000) ||
                (price === 'mid' && record.price >= 20000 && record.price <= 50000) ||
                (price === 'high' && record.price > 50000);
            record.card.hidden = !(categoryMatch && priceMatch);
            if (!record.card.hidden) count++;
        }
        document.querySelector('.catalog__count').textContent = 'Найдено товаров: ' + count;
        document.querySelector('.empty-results').hidden = count !== 0;
    }
    categories.forEach(input => input.addEventListener('change', () => {
        if (input.value === 'all' && input.checked) categories.slice(1).forEach(item => { item.checked = false; });
        if (input.value !== 'all') categories[0].checked = false;
        if (!categories.some(item => item.checked)) categories[0].checked = true;
        updateCatalog();
    }));
    prices.forEach(input => input.addEventListener('change', updateCatalog));
    document.querySelector('.filter-reset').addEventListener('click', () => {
        categories.forEach(input => { input.checked = input.value === 'all'; });
        prices.forEach(input => { input.checked = input.value === 'all'; });
        updateCatalog();
    });
    updateCatalog();
}

const params = new URLSearchParams(location.search);
const requestedId = params.get('product');
const productId = Object.hasOwn(products, requestedId) ? requestedId : 'phone-pro';
const product = products[productId];
const imageKinds = { '📱': 'phone', '💻': 'laptop', '🎧': 'headphones' };
if (document.querySelector('.product__info')) {
    const fields = { '.hero__subtitle': product.category, '.page-hero__title': product.title,
        '.page-hero__description': product.description, '.product__category': product.category,
        '.product__title': product.title, '.product__description': product.description,
        '.product__price': product.price };
    for (const [selector, text] of Object.entries(fields)) document.querySelector(selector).textContent = text;
    const kind = imageKinds[product.image];
    const picture = document.querySelector('.product__image picture');
    picture.querySelector('source').srcset = 'images/' + kind + '-480.webp 480w, images/' + kind + '-960.webp 960w';
    picture.querySelector('img').src = 'images/' + kind + '.svg';
    picture.querySelector('img').alt = product.title;
    const tbody = document.querySelector('.characteristics__table tbody');
    tbody.replaceChildren();
    for (const [label, value] of product.features) {
        const row = document.createElement('tr'); row.setAttribute('role', 'row');
        const heading = document.createElement('th'); heading.scope = 'row'; heading.setAttribute('role', 'rowheader'); heading.textContent = label;
        const cell = document.createElement('td'); cell.setAttribute('role', 'cell'); cell.textContent = value;
        row.append(heading, cell); tbody.append(row);
    }
    document.querySelectorAll('a[href="order.html"]').forEach(link => { link.href = 'order.html?product=' + productId; });
    document.title = product.title + ' — TechStore';
}
const orderSelect = document.querySelector('select[name="product"]');
if (orderSelect && requestedId) {
    const values = { 'phone-pro': 'smartphone-pro-x', 'phone-lite': 'smartphone-lite',
        'laptop-air': 'laptop-air-15', 'laptop-pro': 'notebook-pro-16', 'sound-pro': 'sound-pro', 'sound-mini': 'sound-mini' };
    if (Object.hasOwn(values, requestedId)) orderSelect.value = values[requestedId];
}
const modal = document.querySelector('#request-modal');
let modalOpener;
document.querySelectorAll('[data-modal-open]').forEach(button => button.addEventListener('click', () => {
    if (!modal || modal.open) return;
    modalOpener = button; modal.showModal();
}));
document.querySelectorAll('[data-modal-close]').forEach(button => button.addEventListener('click', () => modal?.close()));
modal?.addEventListener('click', event => {
    const box = modal.getBoundingClientRect();
    if (event.target === modal && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) modal.close();
});
modal?.addEventListener('close', () => modalOpener?.focus());
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('input', event => {
        if (event.target.matches('input, select, textarea')) event.target.removeAttribute('aria-invalid');
        form.querySelector('.form__status').textContent = '';
    });
    form.addEventListener('invalid', event => {
        event.target.setAttribute('aria-invalid', 'true');
        form.querySelector('.form__status').textContent = 'Проверьте обязательные поля и формат данных.';
    }, true);
    form.addEventListener('submit', event => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        const status = form.querySelector('.form__status');
        status.textContent = 'Поля заполнены корректно. Это учебная проверка: заявка не отправлена, данные не сохранены.';
        status.focus();
    });
});

