// offline-data
db.enablePersistence()
	.then()
	.catch(error => {
		if (error.code === 'failed-precondition') {
			// probably multiple tabs open at once
			console.log('Presistence failed');
		} else if (error.code === 'unimplemented') {
			// lack of browser support
			console.log('Persistence is not available');
		}
	});

// real-time listener
db.collection('recipies').onSnapshot(snapshots => {
	snapshots.docChanges().forEach(change => {
		switch (change.type) {
			case 'added': {
				renderRecipe(change.doc.data(), change.doc.id);
				break;
			}
			case 'removed': {
				removeRecipe(change.doc.id);
				break;
			}
			default: {
				console.log(change);
			}
		}
	});
});

// add new recipe
const form = document.querySelector('form');
form.addEventListener('submit', e => {
	e.preventDefault();

	const recipe = {
		title: form.title.value,
		ingredients: form.ingredients.value
	};

	db.collection('recipies')
		.add(recipe)
		.catch(err => console.log(err));

	form.title.value = '';
	form.ingredients.value = '';
});

// delete recipe
const recipeContainer = document.querySelector('.recipes');
recipeContainer.addEventListener('click', e => {
	if (e.target.tagName === 'I') {
		const id = e.target.getAttribute('data-id');
		db.collection('recipies')
			.doc(id)
			.delete();
	}
});
