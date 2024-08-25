const getRandomElements = (arr, num) => {
    // Proveravamo da li je broj elemenata koji tražimo manji ili jednak broju elemenata u nizu
    if (num > arr.length) {
        throw new Error("Requested number of elements exceeds the length of the array.");
    }

    // Kreiramo kopiju niza da ne bismo menjali original
    const arrayCopy = [...arr];

    // Fisher-Yates shuffle algoritam
    for (let i = arrayCopy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]]; // Swap
    }

    // Vraćamo prvih 'num' elemenata iz izmešanog niza
    return arrayCopy.slice(0, num);
}

module.exports = getRandomElements;