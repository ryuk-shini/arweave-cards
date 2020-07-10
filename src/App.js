import React, { Component } from 'react';
import './App.css';

class App extends Component {
	constructor() {
		super();
		let cds = [
			{
				name: 'php',
				img: 'logos/php-logo_1.png',
				id: 1,
			},
			{
				name: 'css3',
				img: 'logos/css3-logo.png',
				id: 2,
			},
			{
				name: 'html5',
				img: 'logos/html5-logo.png',
				id: 3,
			},
			{
				name: 'jquery',
				img: 'logos/jquery-logo.png',
				id: 4,
			},
			{
				name: 'javascript',
				img: 'logos/js-logo.png',
				id: 5,
			},
			{
				name: 'node',
				img: 'logos/nodejs-logo.png',
				id: 6,
			},
			{
				name: 'photoshop',
				img: 'logos/photoshop-logo.png',
				id: 7,
			},
			{
				name: 'python',
				img: 'logos/python-logo.png',
				id: 8,
			},
			{
				name: 'rails',
				img: 'logos/rails-logo.png',
				id: 9,
			},
			{
				name: 'sass',
				img: 'logos/sass-logo.png',
				id: 10,
			},
			{
				name: 'sublime',
				img: 'logos/sublime-logo.png',
				id: 11,
			},
			{
				name: 'wordpress',
				img: 'logos/wordpress-logo.png',
				id: 12,
			},
		];
		this.state = {
			cards: cds,
			shuffleCards: this.shuffle(cds.concat(cds)),
		};
		this.renderCards = this.renderCards.bind(this);
	}
	shuffle(array) {
		var counter = array.length,
			temp,
			index;
		// While there are elements in the array
		while (counter > 0) {
			// Pick a random index
			index = Math.floor(Math.random() * counter);
			// Decrease counter by 1
			counter--;
			// And swap the last element with it
			temp = array[counter];
			array[counter] = array[index];
			array[index] = temp;
		}
		return array;
	}
	renderCards() {
		return (
			<div className="game">
				{this.state.shuffleCards.map((v, k) => {
					return (
						<div className="card" data-id={v.id} key={k}>
							<div className="inside">
								<div className="front">
									<img src={v.img} alt={v.name} />
									<div className="back">
										<img
											src="logos/arweave.png"
											alt="arweave"
										/>
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		);
	}
	render() {
		return (
			<div className="wrap">
				{this.renderCards()}
				<div className="modal-overlay">
					<div className="modal">
						<h2 className="winner">You Rock!</h2>
						<button className="restart">Play Again?</button>
						<p className="message">
							Developed on{' '}
							<a href="https://arweave.rog">ARweave</a> by{' '}
							<a href="https://github.com/elliotyagami">
								Harsh Jain
							</a>
						</p>
						<p className="share-text">Share it?</p>
						<ul className="social">
							<li>
								<a
									target="_blank"
									className="twitter"
									href="https://twitter.com/share?url=https://arweave.org"
								>
									<span className="fa fa-twitter"></span>
								</a>
							</li>
							<li>
								<a
									target="_blank"
									className="facebook"
									href="https://www.facebook.com/sharer.php?u=https://arweave.org"
								>
									<span className="fa fa-facebook"></span>
								</a>
							</li>
							<li>
								<a
									target="_blank"
									className="google"
									href="https://plus.google.com/share?url=https://arweave.org"
								>
									<span className="fa fa-google"></span>
								</a>
							</li>
						</ul>
					</div>
				</div>
				<footer>
					<p className="disclaimer">
						All logos are property of their respective owners, No
						Copyright infringement intended.
					</p>
				</footer>
			</div>
		);
	}
}

export default App;
