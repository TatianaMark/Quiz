(function () {
    const url = new URL(location.href);
    const id = url.searchParams.get('id');
    const answers = url.searchParams.get('answers');
    const score = url.searchParams.get('score');
    const total = url.searchParams.get('total');

    const resultScoreElement = document.querySelector('.result-score');
    if (resultScoreElement && score !== null && total !== null) {
        resultScoreElement.textContent = score + '/' + total;
    }

    document.getElementById('watch-right-answers').onclick = function () {
        const params = new URLSearchParams();
        if (id) {
            params.set('id', id);
        }
        if (answers) {
            params.set('answers', answers);
        }
        if (score !== null) {
            params.set('score', score);
        }
        if (total !== null) {
            params.set('total', total);
        }
        location.href = 'answers.html?' + params.toString();
    }



})();
