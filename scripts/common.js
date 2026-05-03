function checkUserData() {
    const url = new URL(location.href);
    const name = url.searchParams.get('name');
    const lastname = url.searchParams.get('lastName');
    const email = url.searchParams.get('email');

    if (!name || !lastname || !email) {
        location.href = 'index.html'
    }
}