// scripts/scripts.js

$(document).ready(function () {
    console.log("DOM loaded...");

    // Load menu data from JSON file
    $.getJSON('data/menuData.json', function (menuData) {
        console.log("Menu data loaded successfully:", menuData);
        initializeMenu(menuData);
    }).fail(function (jqxhr, textStatus, error) {
        const err = textStatus + ", " + error;
        console.error("Request Failed: " + err);
    });

    // Event Listeners
    $('#loadOrderBtn').on('click', loadLastOrder);
    $('#menuCategories').on('click', '.add-to-cart', handleAddToCart);
    $('#cartItems').on('click', '.increase-qty', handleIncreaseQty);
    $('#cartItems').on('click', '.decrease-qty', handleDecreaseQty);
    $('#cartItems').on('click', '.remove-item', handleRemoveItem);
    $('#orderForm').on('submit', handleFormSubmit);
});

// Cart Array
let cart = [];

// Function to initialize the menu from JSON data
function initializeMenu(menuData) {
    const menuCategoriesContainer = $('#menuCategories');
    menuCategoriesContainer.empty();

    for (const category in menuData) {
        if (menuData.hasOwnProperty(category)) {
            const categoryData = menuData[category];
            const cardColor = getCategoryColor(category);
            const cardHtml = `
                <div class="col-md-4 mb-4">
                    <div class="card h-100">
                        <div class="card-header ${cardColor} text-white">
                            ${category}
                        </div>
                        <div class="card-body">
                            ${generateOptionsHTML(category, categoryData.options)}
                            <!-- Add to Cart Button -->
                            <button type="button" class="btn btn-success add-to-cart" data-category="${category}">Add to Cart</button>
                        </div>
                    </div>
                </div>
            `;
            menuCategoriesContainer.append(cardHtml);
        }
    }
}

// Function to get card color based on category
function getCategoryColor(category) {
    switch (category) {
        case "Burger":
            return "bg-primary";
        case "Pizza":
            return "bg-success";
        case "Pasta":
            return "bg-warning";
        default:
            return "bg-secondary";
    }
}

// Function to generate HTML for options based on category
function generateOptionsHTML(category, options) {
    let html = '';

    switch (category) {
        case "Burger":
            html += generateRadioOptions("burgerBun", "Choose Bun:", options.bun);
            html += generateRadioOptions("burgerMeat", "Select Meat:", options.meat);
            html += generateCheckboxOptions("burgerSauces", "Select Sauces:", options.sauces, "$1");
            html += `
                <div class="form-check mb-3">
                    <input class="form-check-input" type="checkbox" id="doubleStack" name="doubleStack" value="Yes">
                    <label class="form-check-label" for="doubleStack">
                        Double Stack ($1)
                    </label>
                </div>
            `;
            break;

        case "Pizza":
            html += generateRadioOptions("pizzaBase", "Choose Base:", options.base);
            html += generateCheckboxOptions("pizzaToppings", "Select Toppings:", options.toppings, "$0.99");
            break;

        case "Pasta":
            html += generateRadioOptions("pastaType", "Choose Pasta:", options.types);
            break;

        default:
            break;
    }

    return html;
}

// Helper function to generate radio button options
function generateRadioOptions(name, label, optionsArray) {
    let html = `<div class="mb-3">
                    <label class="form-label">${label}</label><br>`;
    optionsArray.forEach((option, index) => {
        const inputId = `${name}${index}`;
        html += `
            <div class="form-check">
                <input class="form-check-input" type="radio" name="${name}" id="${inputId}" value="${option}" ${index === 0 ? 'checked' : ''}>
                <label class="form-check-label" for="${inputId}">
                    ${option}
                </label>
            </div>
        `;
    });
    html += `</div>`;
    return html;
}

// Helper function to generate checkbox options
function generateCheckboxOptions(name, label, optionsArray, price) {
    let html = `<div class="mb-3">
                    <label class="form-label">${label}</label><br>`;
    optionsArray.forEach((option, index) => {
        const inputId = `${name}${index}`;
        html += `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" name="${name}" id="${inputId}" value="${option}">
                <label class="form-check-label" for="${inputId}">
                    ${option} (${price})
                </label>
            </div>
        `;
    });
    html += `</div>`;
    return html;
}

// Function to add item to cart
function addToCart(category, options) {
    const item = {
        category: category,
        options: options,
        quantity: 1,
        price: parseFloat(calculatePrice(category, options))
    };
    cart.push(item);
    console.log("Item added to cart:", item);
    updateCartDisplay();
}

// Function to calculate price based on category and options
function calculatePrice(category, options) {
    let price = 0;
    switch (category) {
        case "Burger":
            price += 5.00; // Base price
            if (options.sauces) {
                price += options.sauces.length * 1; // $1 for each sauce
            }
            if (options.doubleStack === "Yes") {
                price += 1; // $1 for double stack
            }
            break;
        case "Pizza":
            price += 5.99; // Base price
            if (options.toppings) {
                price += options.toppings.length * 0.99; // $0.99 per topping
            }
            break;
        case "Pasta":
            price += 10.99; // Base price
            break;
        default:
            break;
    }
    console.log(`Calculated price for ${category}: $${price.toFixed(2)}`);
    return price.toFixed(2);
}

// Function to update cart display
function updateCartDisplay() {
    const cartItemsContainer = $('#cartItems');
    cartItemsContainer.empty();
    let total = 0;
    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        let optionsList = '';
        for (const key in item.options) {
            if (item.options.hasOwnProperty(key)) {
                if (Array.isArray(item.options[key])) {
                    optionsList += `<strong>${capitalizeFirstLetter(key)}:</strong> ${item.options[key].join(', ')}<br>`;
                } else {
                    optionsList += `<strong>${capitalizeFirstLetter(key)}:</strong> ${item.options[key]}<br>`;
                }
            }
        }
        cartItemsContainer.append(`
            <tr data-index="${index}">
                <td>${item.category}</td>
                <td>${optionsList}</td>
                <td>
                    <button class="btn btn-sm btn-secondary decrease-qty">-</button>
                    ${item.quantity}
                    <button class="btn btn-sm btn-secondary increase-qty">+</button>
                </td>
                <td>$${(item.price * item.quantity).toFixed(2)}</td>
                <td><button class="btn btn-sm btn-danger remove-item">Remove</button></td>
            </tr>
        `);
    });
    $('#cartTotal').text(total.toFixed(2));
    console.log("Cart updated:", cart);
}

// Function to handle Add to Cart button clicks
function handleAddToCart() {
    const category = $(this).data('category');
    console.log(`Add to Cart clicked for category: ${category}`);
    let options = {};

    switch (category) {
        case "Burger":
            options.bun = $('input[name="burgerBun"]:checked').val();
            options.meat = $('input[name="burgerMeat"]:checked').val();
            options.sauces = [];
            $('input[name="burgerSauces"]:checked').each(function () {
                options.sauces.push($(this).val());
            });
            options.doubleStack = $('#doubleStack').is(':checked') ? "Yes" : "No";
            break;

        case "Pizza":
            options.base = $('input[name="pizzaBase"]:checked').val();
            options.toppings = [];
            $('input[name="pizzaToppings"]:checked').each(function () {
                options.toppings.push($(this).val());
            });
            break;

        case "Pasta":
            options.type = $('input[name="pastaType"]:checked').val();
            break;

        default:
            break;
    }

    console.log("Selected options:", options);
    addToCart(category, options);
}

// Function to handle quantity increase
function handleIncreaseQty() {
    const index = $(this).closest('tr').data('index');
    cart[index].quantity += 1;
    console.log(`Increased quantity for item at index ${index}. New quantity: ${cart[index].quantity}`);
    updateCartDisplay();
}

// Function to handle quantity decrease
function handleDecreaseQty() {
    const index = $(this).closest('tr').data('index');
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
        console.log(`Decreased quantity for item at index ${index}. New quantity: ${cart[index].quantity}`);
        updateCartDisplay();
    }
}

// Function to handle item removal
function handleRemoveItem() {
    const index = $(this).closest('tr').data('index');
    console.log(`Removing item at index ${index} from cart.`);
    cart.splice(index, 1);
    updateCartDisplay();
}

// Function to handle form submission
function handleFormSubmit(event) {
    event.preventDefault();

    if (cart.length === 0) {
        alert("Your cart is empty. Please add items to your cart before submitting.");
        return;
    }

    const updatedOrder = {
        customerName: $('#customerName').val(),
        contactNumber: $('#contactNumber').val(),
        deliveryAddress: $('#deliveryAddress').val(),
        deliveryTime: $('#deliveryTime').val(),
        items: cart
    };

    // Display updated order in the DOM
    displayUpdatedOrder(updatedOrder);

    // Log updated order to the console in JSON format
    console.log("Order Submitted:", JSON.stringify(updatedOrder, null, 2));

    // Save the order to localStorage as lastOrder
    localStorage.setItem('lastOrder', JSON.stringify(updatedOrder));
    console.log("Order saved to localStorage as 'lastOrder'.");

    // Clear the cart
    cart = [];
    updateCartDisplay();

    // Reset the form
    $('#orderForm')[0].reset();
    console.log("Form reset.");
}

// Function to display updated order in the DOM
function displayUpdatedOrder(order) {
    let orderHtml = `
        <h3>Order Submitted Successfully!</h3>
        <p><strong>Customer Name:</strong> ${order.customerName}</p>
        <p><strong>Contact Number:</strong> ${order.contactNumber}</p>
        <p><strong>Delivery Address:</strong> ${order.deliveryAddress}</p>
        <p><strong>Delivery Time:</strong> ${order.deliveryTime}</p>
        <h4>Items:</h4>
        <ul>
    `;
    order.items.forEach((item, index) => {
        orderHtml += `
            <li>
                <strong>Item ${index + 1}:</strong> ${item.category}
                <ul>
        `;
        for (const key in item.options) {
            if (item.options.hasOwnProperty(key)) {
                if (Array.isArray(item.options[key])) {
                    orderHtml += `<li><strong>${capitalizeFirstLetter(key)}:</strong> ${item.options[key].join(', ')}</li>`;
                } else {
                    orderHtml += `<li><strong>${capitalizeFirstLetter(key)}:</strong> ${item.options[key]}</li>`;
                }
            }
        }
        orderHtml += `
                </ul>
                <p><strong>Quantity:</strong> ${item.quantity}</p>
                <p><strong>Price:</strong> $${(item.price * item.quantity).toFixed(2)}</p>
            </li>
        `;
    });
    orderHtml += '</ul>';
    $('#updatedOrder').html(orderHtml);
    console.log("Order displayed on the page.");
}

// Function to load last order into the form and cart
function loadLastOrder() {
    const lastOrder = JSON.parse(localStorage.getItem('lastOrder'));
    if (!lastOrder) {
        alert("No last order found.");
        console.warn("No last order available in localStorage.");
        return;
    }

    console.log("Loading last order:", lastOrder);

    // Populate form fields
    $('#customerName').val(lastOrder.customerName);
    $('#contactNumber').val(lastOrder.contactNumber);
    $('#deliveryAddress').val(lastOrder.deliveryAddress);
    $('#deliveryTime').val(lastOrder.deliveryTime);

    // Clear current cart
    cart = [];

    // Populate cart with last order items
    lastOrder.items.forEach(item => {
        cart.push(item);
    });

    updateCartDisplay();
    console.log("Last order loaded into the form and cart.");
}

// Function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
