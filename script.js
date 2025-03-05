// Функции для главной страницы
function scrollToSection() {
    const infoSection = document.getElementById('info');
    if (infoSection) {
        infoSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function scrollToLeader() {
    const leaderSection = document.getElementById('leader');
    if (leaderSection) {
        leaderSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function toggleOtherSkill(select) {
    const otherSkillField = document.getElementById('otherSkillField');
    if (otherSkillField) {
        if (select.value === 'Другое') {
            otherSkillField.style.display = 'block';
            document.getElementById('otherSkillInput').required = true;
        } else {
            otherSkillField.style.display = 'none';
            document.getElementById('otherSkillInput').required = false;
            document.getElementById('otherSkillInput').value = '';
        }
    }
}

function submitForm(event) {
    event.preventDefault();
    
    const realName = document.getElementById('realName').value;
    const ageOOC = document.getElementById('ageOOC').value;
    const location = document.getElementById('location').value;
    const timezone = document.getElementById('timezone').value;
    const averageOnline = document.getElementById('averageOnline').value;
    const moveWithFamily = document.getElementById('moveWithFamily').value;
    const bestSkill = document.getElementById('bestSkill').value;
    const otherSkillInput = document.getElementById('otherSkillInput').value;
    const preference = document.getElementById('preference').value;
    const previousOrganizations = document.getElementById('previousOrganizations').value;
    const discord = document.getElementById('discord').value;

    let bestSkillText = bestSkill;
    if (bestSkill === 'Другое' && otherSkillInput) {
        bestSkillText += `: ${otherSkillInput}`;
    }

    const discordPayload = {
        content: `Новая заявка в семью Family Dargon:\n` +
                 `**Ваше имя [OOC]:** ${realName}\n` +
                 `**Сколько вам лет? [OOC]:** ${ageOOC}\n` +
                 `**Откуда вы? [OOC]:** ${location}\n` +
                 `**Ваш часовой пояс [OOC]:** ${timezone}\n` +
                 `**Ваш средний онлайн:** ${averageOnline}\n` +
                 `**Готовы ли вы двигаться вместе с семьей?** ${moveWithFamily}\n` +
                 `**Что у вас получается больше всего?** ${bestSkillText}\n` +
                 `**Что вы предпочитаете:** ${preference}\n` +
                 `**В каких организациях ранее состояли:** ${previousOrganizations}\n` +
                 `**Ваш Discord:** ${discord}`
    };

    fetch('https://discord.com/api/webhooks/1283394800900374561/jXFQEr-ssG45oKO-z9cx0nCw0M6uVGPBY-QYGzVo0cXVzKNKsgUaUVooRC-oxsqBxBrH', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(discordPayload),
    })
    .then(response => {
        if (response.ok) {
            document.getElementById('status').textContent = 'Заявка успешно отправлена в Discord!';
            document.getElementById('join-form').reset();
            document.getElementById('otherSkillField').style.display = 'none';
            document.getElementById('otherSkillInput').value = '';
        } else {
            document.getElementById('status').textContent = 'Ошибка при отправке заявки. Попробуйте позже.';
        }
    })
    .catch(error => {
        document.getElementById('status').textContent = 'Ошибка: ' + error.message;
    });
}

// Функции для галереи и входа
let isAdmin = false;

function showLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.style.display = 'block';
    } else {
        console.error('Модальное окно не найдено!');
    }
}

function closeLoginModal() {
    const loginModal = document.getElementById('loginModal');
    const loginStatus = document.getElementById('loginStatus');
    if (loginModal && loginStatus) {
        loginModal.style.display = 'none';
        loginStatus.textContent = '';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    }
}

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const status = document.getElementById('loginStatus');

    if (!username || !password || !status) {
        console.error('Элементы формы входа не найдены!');
        return;
    }

    if (username === 'admin' && password === 'admin123') {
        isAdmin = true;
        status.textContent = 'Добро пожаловать, администратор!';
        document.getElementById('adminControls').style.display = 'block';
        document.querySelectorAll('.delete-btn').forEach(btn => btn.style.display = 'block');
        setTimeout(closeLoginModal, 1000);
    } else if (username === 'user' && password === 'user123') {
        isAdmin = false;
        status.textContent = 'Добро пожаловать, пользователь!';
        document.getElementById('adminControls').style.display = 'none';
        document.querySelectorAll('.delete-btn').forEach(btn => btn.style.display = 'none');
        setTimeout(closeLoginModal, 1000);
    } else {
        status.textContent = 'Неверный логин или пароль!';
    }
}

function addMedia() {
    if (!isAdmin) {
        alert('Только администратор может добавлять медиа!');
        return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.onchange = function(event) {
        const file = event.target.files[0];
        const galleryGrid = document.getElementById('galleryGrid');
        
        if (file) {
            // Проверка размера файла (лимит 10 МБ, как на сервере)
            const maxSize = 10 * 1024 * 1024; // 10 МБ
            if (file.size > maxSize) {
                alert(`Файл слишком большой (${(file.size / 1024 / 1024).toFixed(2)} МБ)! Максимальный размер: ${(maxSize / 1024 / 1024).toFixed(2)} МБ.`);
                return;
            }

            console.log('Добавляем файл:', file.name, file.type);
            const formData = new FormData();
            formData.append('media', file);

            fetch('http://localhost:3000/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                    return;
                }

                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';
                galleryItem.dataset.filename = data.filePath.split('/').pop(); // Сохраняем имя файла для удаления

                if (file.type.startsWith('image/')) {
                    console.log('Добавляем изображение');
                    const img = document.createElement('img');
                    img.src = data.filePath;
                    img.alt = 'Добавленное фото';
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'delete-btn';
                    deleteBtn.textContent = '×';
                    deleteBtn.onclick = function() { deleteMedia(deleteBtn); };
                    galleryItem.appendChild(img);
                    galleryItem.appendChild(deleteBtn);
                } else if (file.type.startsWith('video/')) {
                    console.log('Добавляем видео');
                    const video = document.createElement('video');
                    video.controls = true;
                    const source = document.createElement('source');
                    source.src = data.filePath;
                    source.type = file.type;
                    video.appendChild(source);
                    video.onerror = function() {
                        console.error('Ошибка загрузки видео:', source.src);
                    };
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'delete-btn';
                    deleteBtn.textContent = '×';
                    deleteBtn.onclick = function() { deleteMedia(deleteBtn); };
                    galleryItem.appendChild(video);
                    galleryItem.appendChild(deleteBtn);
                } else {
                    console.error('Неподдерживаемый тип файла:', file.type);
                    alert('Пожалуйста, загрузите изображение или видео!');
                    return;
                }
                galleryGrid.appendChild(galleryItem);
            })
            .catch(error => {
                console.error('Ошибка загрузки файла:', error);
                alert('Ошибка при загрузке файла. Попробуйте снова.');
            });
        }
    };
    input.click();
}

function deleteMedia(button) {
    if (!isAdmin) {
        alert('Только администратор может удалять медиа!');
        return;
    }
    const galleryItem = button.parentElement;
    const filename = galleryItem.dataset.filename;
    console.log('Удаляем медиа:', filename);

    fetch(`http://localhost:3000/media/${filename}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
            return;
        }
        galleryItem.remove();
        console.log('Файл удален:', filename);
    })
    .catch(error => {
        console.error('Ошибка удаления файла:', error);
        alert('Ошибка при удалении файла. Попробуйте снова.');
    });
}

function loadGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) {
        console.error('Галерея не найдена!');
        return;
    }

    fetch('http://localhost:3000/media')
    .then(response => response.json())
    .then(media => {
        console.log('Загружаем галерею, количество элементов:', media.length);
        galleryGrid.innerHTML = ''; // Очищаем текущую галерею
        media.forEach(item => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.dataset.filename = item.src.split('/').pop(); // Сохраняем имя файла для удаления

            if (item.type === 'img') {
                console.log('Загружаем изображение:', item.src);
                const img = document.createElement('img');
                img.src = item.src;
                img.alt = 'Загруженное фото';
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.textContent = '×';
                deleteBtn.onclick = function() { deleteMedia(deleteBtn); };
                galleryItem.appendChild(img);
                galleryItem.appendChild(deleteBtn);
            } else if (item.type === 'video') {
                console.log('Загружаем видео:', item.src);
                const video = document.createElement('video');
                video.controls = true;
                const source = document.createElement('source');
                source.src = item.src;
                source.type = item.src.match(/\.mp4$/i) ? 'video/mp4' : 'video/webm';
                video.appendChild(source);
                video.onerror = function() {
                    console.error('Ошибка загрузки видео при восстановлении:', source.src);
                };
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.textContent = '×';
                deleteBtn.onclick = function() { deleteMedia(deleteBtn); };
                galleryItem.appendChild(video);
                galleryItem.appendChild(deleteBtn);
            }
            galleryGrid.appendChild(galleryItem);
        });
    })
    .catch(error => {
        console.error('Ошибка загрузки галереи:', error);
        alert('Ошибка загрузки галереи. Проверьте, запущен ли сервер.');
    });

    // Устанавливаем видимость кнопок удаления в зависимости от роли
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.style.display = isAdmin ? 'block' : 'none';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Сайт загружен!');
    loadGallery(); // Загружаем галерею с сервера
    if (!isAdmin) {
        const adminControls = document.getElementById('adminControls');
        if (adminControls) {
            adminControls.style.display = 'none';
        }
        document.querySelectorAll('.delete-btn').forEach(btn => btn.style.display = 'none');
    }
});