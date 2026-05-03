(function () {
    const Answers = {
        quiz: null,
        rightAnswers: null,
        userAnswers: null,
        answersId: null,

        init() {
            const url = new URL(location.href);
            this.answersId = url.searchParams.get('id');

            this.initBackLink();

            if (!this.answersId) {
                console.log('ID не передан');
                location.href = 'index.html';
                return;
            }

            // Получаем ответы пользователя из URL
            this.loadUserAnswersFromURL();

            // Получаем правильные ответы
            this.loadRightAnswers();
        },

        initBackLink() {
            const backLink = document.querySelector('.answers-link-back a');


            backLink.addEventListener('click', function (event) {
                event.preventDefault();

                const url = new URL(location.href);
                const params = new URLSearchParams();
                const id = url.searchParams.get('id');
                const score = url.searchParams.get('score');
                const total = url.searchParams.get('total');
                const answers = url.searchParams.get('answers');

                if (id) {
                    params.set('id', id);
                }
                if (score !== null) {
                    params.set('score', score);
                }
                if (total !== null) {
                    params.set('total', total);
                }
                if (answers) {
                    params.set('answers', answers);
                }

                location.href = 'result.html?' + params.toString();
            });
        },

        loadUserAnswersFromURL() {
            const url = new URL(location.href);
            const answersParam = url.searchParams.get('answers');

            console.log('Параметр answers из URL:', answersParam);

            if (answersParam) {
                try {
                    // Декодируем и парсим JSON
                    const decodedAnswers = decodeURIComponent(answersParam);
                    this.userAnswers = JSON.parse(decodedAnswers);
                    console.log('Ответы пользователя загружены из URL:', this.userAnswers);
                } catch (e) {
                    console.error('Ошибка парсинга ответов из URL:', e);
                    this.userAnswers = [];
                }
            } else {
                console.log('Параметр answers не найден в URL');
                this.userAnswers = [];
            }
        },

        loadRightAnswers() {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://testologia.ru/get-quiz-right?id=' + this.answersId, false);
            xhr.send();

            if (xhr.status === 200 && xhr.responseText) {
                try {
                    this.rightAnswers = JSON.parse(xhr.responseText);
                    console.log('Верные ответы:', this.rightAnswers);
                    this.loadQuiz();
                } catch (e) {
                    console.error('Ошибка парсинга ответов:', e);
                    location.href = 'index.html';
                }
            } else {
                console.error('Ошибка загрузки ответов');
                location.href = 'index.html';
            }
        },

        loadQuiz() {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://testologia.ru/get-quiz?id=' + this.answersId, false);
            xhr.send();

            if (xhr.status === 200 && xhr.responseText) {
                try {
                    this.quiz = JSON.parse(xhr.responseText);
                    console.log('Данные теста:', this.quiz);
                    this.showAnswers();
                } catch (e) {
                    console.error('Ошибка парсинга теста:', e);
                    location.href = 'index.html';
                }
            } else {
                console.error('Ошибка загрузки теста');
                location.href = 'index.html';
            }
        },

        showAnswers() {
            if (!this.quiz || !this.quiz.questions) {
                this.showError('Нет данных для отображения');
                return;
            }

            // Обновляем название теста
            this.updateTestName();

            // Получаем контейнер
            const container = document.querySelector('.answers-questions');
            if (!container) {
                console.error('Контейнер .answers-questions не найден');
                return;
            }

            container.innerHTML = '';

            // Отображаем вопросы
            this.quiz.questions.forEach((question, index) => {
                this.renderQuestion(question, index, container);
            });

        },

        renderQuestion(question, index, container) {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'answer-question';

            // Заголовок
            const questionTitle = document.createElement('div');
            questionTitle.className = 'answer-question-title';
            questionTitle.innerHTML = `<span>Вопрос ${index + 1}:</span> ${this.escapeHtml(question.question)}`;
            questionDiv.appendChild(questionTitle);

            // Варианты ответов
            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'answer-question-options';
            const optionsList = document.createElement('ul');
            optionsList.className = 'answer-question-options-ul';

            // Находим ответ пользователя
            const userAnswer = this.userAnswers?.find(a => a.questionId === question.id);
            const chosenAnswerId = userAnswer?.chosenAnswerId;

            // Правильный ответ
            const correctAnswerId = this.rightAnswers && this.rightAnswers[index] ? this.rightAnswers[index] : null;

            // Проверка
            const isUserAnswerCorrect = (chosenAnswerId !== null && chosenAnswerId !== undefined && correctAnswerId !== null && chosenAnswerId === correctAnswerId);

            question.answers.forEach(answer => {
                const listItem = document.createElement('li');
                listItem.className = 'test-question-option';

                const isSelectedByUser = (chosenAnswerId === answer.id);

                if (isSelectedByUser) {
                    if (isUserAnswerCorrect) {
                        listItem.classList.add('correct-answer');
                    } else {
                        listItem.classList.add('wrong-answer');
                    }
                }

                const answerSpan = document.createElement('span');
                answerSpan.textContent = this.escapeHtml(answer.answer);
                listItem.appendChild(answerSpan);
                optionsList.appendChild(listItem);
            });

            optionsDiv.appendChild(optionsList);
            questionDiv.appendChild(optionsDiv);

            // Если нет ответа
            if (!chosenAnswerId) {
                const noAnswerNote = document.createElement('div');
                noAnswerNote.style.marginTop = '15px';
                noAnswerNote.style.padding = '10px';
                noAnswerNote.style.backgroundColor = '#F3EEFF';
                noAnswerNote.style.border = '1px solid #DCDCF3';
                noAnswerNote.style.borderRadius = '5px';
                noAnswerNote.style.color = '#6933DC';
                noAnswerNote.innerHTML = 'Вы не ответили на этот вопрос';
                questionDiv.appendChild(noAnswerNote);
            }

            container.appendChild(questionDiv);
        },

        updateTestName() {
            const testNameElement = document.querySelector('.answer-test-name');
            if (testNameElement && this.quiz.name) {
                testNameElement.textContent = this.quiz.name;
            }
        },

        showError(message) {
            const container = document.querySelector('.answers-questions');
            if (container) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 40px; background: #f8d7da; border-radius: 8px; color: #721c24;">
                        <strong>Ошибка:</strong> ${message}
                    </div>
                `;
            }
        },

        escapeHtml(str) {
            if (!str) return '';
            return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => Answers.init());
    } else {
        Answers.init();
    }
})();
