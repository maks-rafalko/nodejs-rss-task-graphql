// remove item from array by value
const removeArrayItem = (array: unknown[], value: unknown) => {
    const index = array.indexOf(value);

    if (index !== -1) {
        array.splice(index, 1);
    }
}

export { removeArrayItem };