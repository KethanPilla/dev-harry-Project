// Data object representing the last order
const lastOrder = {
    orderNumber: 12345,
    customerName: "John Doe",
    contactNumber: "555-123-4567",
    deliveryAddress: "123 Main Street",
    deliveryTime: "2024-11-20T18:30",
    items: [
        { name: "Cheeseburger", quantity: 2, instructions: "No pickles" },
        { name: "Fries", quantity: 1, instructions: "" },
        { name: "Soda", quantity: 1, instructions: "No ice" }
    ]
};

// Function to load last order into the form
function loadLastOrder() {
    console.log("Loading last order...");
    $('#customerName').val(lastOrder.customerName);
    $('#contactNumber').val(lastOrder.contactNumber);
    $('#deliveryAddress').val(lastOrder.deliveryAddress);
    $('#deliveryTime').val(lastOrder.deliveryTime);

    // Clear any existing items
    $('#orderItems').empty();

    // Populate items
    lastOrder.items.forEach((item, index) => {
        addItemToForm(item, index);
    });
}

// Function to add an item to the form
function addItemToForm(item = {}, index) {
    const itemHtml = `
        <div class="item mb-3" data-index="${index}">
            <h5>Item ${index + 1}</h5>
            <div class="mb-3">
                <label class="form-label">Item Name:</label>
                <input type="text" name="itemName" class="form-control" value="${item.name || ''}">
            </div>
            <div class="mb-3">
                <label class="form-label">Quantity:</label>
                <input type="number" name="quantity" class="form-control" value="${item.quantity || 1}">
            </div>
            <div class="mb-3">
                <label class="form-label">Special Instructions:</label>
                <textarea name="instructions" class="form-control" rows="2">${item.instructions || ''}</textarea>
            </div>
            <button type="button" class="btn btn-danger removeItemBtn">Remove Item</button>
            <hr>
        </div>
    `;
    $('#orderItems').append(itemHtml);
}

// Function to add a new empty item to the form
function addNewItem() {
    const index = $('#orderItems .item').length;
    addItemToForm({}, index);
}

// Function to handle form submission
function handleFormSubmit(event) {
    event.preventDefault();

    const updatedOrder = {
        customerName: $('#customerName').val(),
        contactNumber: $('#contactNumber').val(),
        deliveryAddress: $('#deliveryAddress').val(),
        deliveryTime: $('#deliveryTime').val(),
        items: []
    };

    $('#orderItems .item').each(function () {
        const item = {
            name: $(this).find('input[name="itemName"]').val(),
            quantity: parseInt($(this).find('input[name="quantity"]').val()),
            instructions: $(this).find('textarea[name="instructions"]').val()
        };
        updatedOrder.items.push(item);
    });

    // Display updated order in the DOM
    displayUpdatedOrder(updatedOrder);

    // Log updated order to the console in JSON format
    console.log(JSON.stringify(updatedOrder, null, 2));
}

// Function to display updated order in the DOM
function displayUpdatedOrder(order) {
    let orderHtml = `
        <h3>Updated Order Details:</h3>
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
                <strong>Item ${index + 1}:</strong> ${item.name} (Quantity: ${item.quantity})
                <p><em>Instructions:</em> ${item.instructions}</p>
            </li>
        `;
    });
    orderHtml += '</ul>';
    $('#updatedOrder').html(orderHtml);
}

// Event listeners
$(document).ready(function () {
    console.log("DOM loaded...");
    // Load last order button
    $('#loadOrderBtn').on('click', loadLastOrder);
// $('#loadOrderBtn').on('click', function(){
//     console.log("Loading last order...");
// })
    // Add item button
    $('#addItemBtn').on('click', addNewItem);

    // Remove item button
    $('#orderItems').on('click', '.removeItemBtn', function () {
        $(this).closest('.item').remove();
    });

    // Form submission
    $('#orderForm').on('submit', handleFormSubmit);
});
