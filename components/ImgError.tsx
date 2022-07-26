export default function Images() {
	const replaceImgWithError = (e) => {
		e.target.onerror = null
		e.target.src = 'http://placekitten.com/g/200/300'
	}

	const hideImgWhenError = (e) => {
		e.target.onerror = null
		e.target.style.display = 'none'
	}

	return (
		<>
			<p>hi</p>
			<img
				onError={replaceImgWithError}
				alt="foo"
				src="https://crablets-event-images.s3.amazonaws.com/users/10/top"
			/>
			<img
				onError={hideImgWhenError}
				alt="foo"
				src="https://crablets-event-images.s3.amazonaws.com/users/10/top"
			/>
		</>
	)
}
