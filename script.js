const searchInput = document.querySelector('.search');
const filterPanel = document.querySelector('#filters');
const filterToggle = document.querySelector('#filter-toggle');
const filterClose = document.querySelector('#filter-close');
const overlay = document.querySelector('#overlay');
const themeToggle = document.querySelector('#theme-toggle');
const cards = [...document.querySelectorAll('.card')];
const checkboxes = [...document.querySelectorAll('#filters input[type="checkbox"]')];

//опред типа и подсветки каждого товара по его тексту
cards.forEach(card => {
    const category = card.querySelector('.category')?.textContent.toLowerCase() || '';
    const description = card.querySelector('.description')?.textContent.toLowerCase() || '';
    const title = card.querySelector('h2')?.textContent.toLowerCase() || '';

    if (category.includes('аксессуар')) {
        card.dataset.type = 'accessories';
    } else if (category.includes('свитч')) {
        card.dataset.type = 'switches';
    } else {
        card.dataset.type = 'keyboard';
    }

    //использование слов RGB из описания товара
    card.dataset.lighting = /rgb|подсветк/i.test(description + ' ' + title)
        ? 'rgb'
        : 'none';
});

//фильтрация и поиск
function filterProducts() {
    const selectedTypes = checkboxes
        .filter(input => input.checked && input.name === 'type')
        .map(input => input.value);
    const selectedLighting = checkboxes
        .filter(input => input.checked && input.name === 'lighting')
        .map(input => input.value);

    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach(card => {
        const typeMatch =
            selectedTypes.length === 0 ||
            selectedTypes.includes(card.dataset.type);
        const lightingMatch =
            selectedLighting.length === 0 ||
            selectedLighting.includes(card.dataset.lighting);
        const searchableText = card.textContent.toLowerCase();
        const searchMatch = searchableText.includes(query);
        const isVisible = typeMatch && lightingMatch && searchMatch;
        card.hidden = !isVisible;
        if (isVisible) visibleCount++;
    });
    let emptyMessage = document.querySelector('.empty-message');
    if (!emptyMessage) {
        emptyMessage = document.createElement('p');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'Ничего не найдено. Попробуй изменить фильтры.';
        document.querySelector('.catalog').append(emptyMessage);
    }
    emptyMessage.hidden = visibleCount > 0;
}
checkboxes.forEach(input => {
    input.addEventListener('change', filterProducts);
});
searchInput.addEventListener('input', filterProducts);

//переключение темы
function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('keebcraft-theme', theme);
    themeToggle.textContent =
        theme === 'dark' ? 'Светлая тема' : 'Тёмная тема';
}
const savedTheme = localStorage.getItem('keebcraft-theme');
setTheme(savedTheme === 'light' ? 'light' : 'dark');
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.dataset.theme;
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

//мобильная панель фильтров
function openFilters() {
    filterPanel.classList.add('is-open');
    overlay.classList.add('is-visible');
    document.body.classList.add('filters-open');
}
function closeFilters() {
    filterPanel.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    document.body.classList.remove('filters-open');
}
filterToggle.addEventListener('click', openFilters);
filterClose.addEventListener('click', closeFilters);
overlay.addEventListener('click', closeFilters);
document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeFilters();
});

//первоначальный показ всех товаров
filterProducts();
const cartButton = document.querySelector('#cart-button');
const cartWindow = document.querySelector('#cart-window');
const cartClose = document.querySelector('#cart-close');
const cartItems = document.querySelector('#cart-items');
const cartTotal = document.querySelector('#cart-total');
const cart = {};
function getPrice(card) {
    const priceText = card.querySelector('.price strong').textContent;
    return Number(priceText.replace(/[^\d]/g, ''));
}

function updateCart() {
    cartItems.innerHTML = '';
    let total = 0;
    let count = 0;
    for (const name in cart) {
        const item = cart[name];
        total += item.price * item.quantity;
        count += item.quantity;
        const row = document.createElement('div');
        row.className = 'cart-item';
        const info = document.createElement('span');
        info.textContent =
            `${name} — ${item.price.toLocaleString('ru-RU')} ₽ × ${item.quantity}`;
        const remove = document.createElement('button');
        remove.textContent = '−';
        remove.type = 'button';
        remove.setAttribute('aria-label', `Убрать один товар: ${name}`);

        remove.addEventListener('click', () => {
            item.quantity--;
            if (item.quantity <= 0) {
                delete cart[name];
            }
            updateCart();
        });
        row.append(info, remove);
        cartItems.append(row);
    }
    if (count === 0) {
        cartItems.textContent = 'Корзина пока пустая.';
    }
    cartTotal.textContent = total.toLocaleString('ru-RU') + ' ₽';
    cartButton.textContent = `Корзина (${count})`;
}

//добавление товаров
document.querySelectorAll('.buy-button').forEach(button => {
    button.addEventListener('click', () => {
        const card = button.closest('.card');
        const name = card.querySelector('h2').textContent.trim();
        const price = getPrice(card);
        if (cart[name]) {
            cart[name].quantity++;
        } else {
            cart[name] = {
                price: price,
                quantity: 1
            };
        }
        updateCart();
        button.textContent = 'Добавлено!';
        setTimeout(() => {
            button.textContent = 'В корзину';
        }, 1000);
    });
});

//открытие и закрытие корзины
cartButton.addEventListener('click', () => {
    cartWindow.hidden = false;
});
cartClose.addEventListener('click', () => {
    cartWindow.hidden = true;
});
cartWindow.addEventListener('click', event => {
    if (event.target === cartWindow) {
        cartWindow.hidden = true;
    }
});
updateCart();

//кнопка на анимации
const explodeButton = document.querySelector('#explode-button');
const keyboard = document.querySelector('.keyboard-3d');
explodeButton.addEventListener('click', () => {
    keyboard.classList.toggle('exploded');
})

//магнит к мыши
document.addEventListener('mousemove', (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 10;
    const y = (event.clientY / window.innerHeight - 0.5) * 10;
    keyboard.style.transform =
    `rotateX(${50 - y}deg) rotateY(${10 + x}deg)`;

})