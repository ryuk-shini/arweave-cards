import React, { Component } from 'react';
import './App.css';
import Arweave from 'arweave/web';

const hasClass = (elem, name) => {
	let e = elem.className;
	return e.indexOf(name) > -1 ? true : false;
};

function addClass(elem, cls) {
	elem.className += ' ' + cls;
}

const attr = (elem, name) => {
	return elem.getAttribute(name);
};

function removeClass(ele, cls) {
	if (hasClass(ele, cls)) {
		var reg = new RegExp(cls, 'g');
		ele.className = ele.className.replace(reg, '');
	}
}

function fadeIn(fadeTarget, interval) {
	var fadeEffect = setTimeout(function () {
		fadeTarget.style.display = 'block';
		fadeTarget.style.opacity = '';
	}, interval);
}

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
			paused: false,
			guess: null,
			score: 1000,
			finished: false,
			loggedIn: false,
			wallet: {},
		};
		this.renderCards = this.renderCards.bind(this);
		this.checkCard = this.checkCard.bind(this);
		this.win = this.win.bind(this);
		this.reset = this.reset.bind(this);
		this.login = this.login.bind(this);
		this.submitScore = this.submitScore.bind(this);
	}
	async submitScore() {
		var unixTime = Math.round(new Date().getTime() / 1000);
		var tx = await this.state.arweave.createTransaction(
			{
				data: this.state.score.toString(),
			},
			this.state.wallet,
		);
		console.log(tx);
		tx.addTag('App-Name', 'arweave-cards');
		tx.addTag('App-Version', '0.0.1');
		tx.addTag('Unix-Time', unixTime);
		tx.addTag('Type', 'score');
		await this.state.arweave.transactions.sign(tx, this.state.wallet);
		console.log(tx.id);
		await this.state.arweave.transactions.post(tx);
		alert('Submitting score');
	}
	fetchScore() {}
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
	checkCard(e) {
		let elem = e.currentTarget;
		// let inside= e.currentTarget.querySelector('inside')

		if (
			!this.state.paused &&
			!hasClass(elem, 'matched') &&
			!hasClass(elem, 'picked')
		) {
			let newScore = this.state.score - 10;
			this.setState({ score: newScore > 0 ? newScore : 0 });
			addClass(elem, 'picked');
			if (!this.state.guess) {
				this.setState({ guess: attr(elem, 'data-id') });
			} else if (
				this.state.guess == attr(elem, 'data-id')
				// !hasClass(elem, 'picked')
			) {
				Array.from(document.getElementsByClassName('picked')).forEach(
					(ele) => {
						addClass(ele, 'matched');
					},
				);
				this.setState({ guess: null });
			} else {
				this.setState({ guess: null, pause: true });
				let _this = this;
				setTimeout(() => {
					Array.from(
						document.getElementsByClassName('picked'),
					).forEach((ele) => {
						removeClass(ele, 'picked');
					});
					_this.setState({ paused: false });
				}, 500);
			}
			if (
				document.getElementsByClassName('matched').length !=
				this.state.shuffleCards.length
			) {
				this.win();
			}
		}
	}
	win() {
		this.setState({ pause: true, finished: true });
		this.submitScore();
		setTimeout(() => {
			this.showModal();
		}, 1000);
	}
	showModal() {
		document.getElementsByClassName('modal-overlay')[0].style.display =
			'block';
		fadeIn(document.getElementsByClassName('modal')[0], 100);
	}
	hideModal() {
		document.getElementsByClassName('modal')[0].style.display = 'none';
		document.getElementsByClassName('modal-overlay')[0].style.display =
			'none';
	}
	reset() {
		if (!this.state.loggedIn) return;
		Array.from(document.getElementsByClassName('inside')).forEach((ele) => {
			removeClass(ele, 'picked');
			removeClass(ele, 'matched');
		});
		this.hideModal();
		let cds = this.state.cards;
		this.setState({
			shuffleCards: this.shuffle(cds.concat(cds)),
			paused: false,
			guess: null,
			score: 1000,
		});
	}
	renderCards() {
		return (
			<div className="game">
				{this.state.shuffleCards.map((v, k) => {
					return (
						<div className="card" key={k}>
							<div
								className="inside"
								data-id={v.id}
								onClick={this.checkCard}
							>
								<div className="front">
									<img src={v.img} alt={v.name} />
								</div>
								<div className="back">
									<img
										src="logos/arweave.png"
										alt="arweave"
									/>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		);
	}
	componentDidMount() {
		var arweave = Arweave.init({
			host: 'arweave.net',
			port: 443,
			protocol: 'https',
		});
		this.setState({ arweave });
	}
	login(event) {
		event.stopPropagation();
		event.preventDefault();
		const _this = this;
		var fr = new FileReader();
		fr.onload = function (ev) {
			try {
				let wallet = JSON.parse(ev.target.result);

				_this.state.arweave.wallets
					.jwkToAddress(wallet)
					.then((address) => {
						console.log(address);
						_this.setState({ wallet, loggedIn: true, address });
						_this.hideModal();
						// update_login_state(true, public_address);
					});
			} catch (err) {
				alert('Error logging in: ' + err);
			}
		};
		fr.readAsText(event.target.files[0]);
	}
	render() {
		return (
			<div className="wrap">
				{this.renderCards()}
				<div className="modal-overlay">
					<div className="modal">
						<h2 className="label">AR Cards</h2>

						{this.state.finished ? (
							<div>
								<h4 className="winner">You Rock!</h4>
								<span>{this.state.address}</span>
								<span>{this.state.score}</span>
							</div>
						) : (
							''
						)}
						{!this.state.loggedIn ? (
							<div className="not-logged-in">
								<div className="file-input">
									{
										//https://stackoverflow.com/questions/37457128/react-open-file-browser-on-click-a-divs
									}
									<input
										className="clickable"
										type="file"
										id="file"
										onChange={this.login}
									/>
									<div id="desc">
										Drop a wallet keyfile to login
									</div>
								</div>
								<div className="mt-3">
									<p
										style={{ textAlign: 'center' }}
										className="message"
									>
										Don't have a wallet? Get one{' '}
										<a
											href="https://tokens.arweave.org/"
											target="_blank"
										>
											here
										</a>
										!
									</p>
								</div>
							</div>
						) : (
							''
						)}
						<button className="restart" onClick={this.reset}>
							Play Again?
						</button>
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
