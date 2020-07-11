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
function getUrl(id) {
	return `https://viewblock.io/arweave/tx/${id}`;
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
				name: 'BTC',
				img: 'logos/bitcoin.png',
				id: 1,
			},
			{
				name: 'ETH',
				img: 'logos/ethereum.png',
				id: 2,
			},
			{
				name: 'monero',
				img: 'logos/monero.png',
				id: 3,
			},
			{
				name: 'status',
				img: 'logos/status.png',
				id: 4,
			},
			{
				name: 'zcash',
				img: 'logos/zcash.png',
				id: 5,
			},
			{
				name: 'cosmos',
				img: 'logos/cosmos.png',
				id: 6,
			},
			{
				name: 'chainlink',
				img: 'logos/chainlink.png',
				id: 7,
			},
			{
				name: 'cardano',
				img: 'logos/cardano.png',
				id: 8,
			},
			{
				name: 'BAT',
				img: 'logos/basic-attention-token.png',
				id: 9,
			},
			{
				name: 'matic-network',
				img: 'logos/matic-network.png',
				id: 10,
			},
			{
				name: 'algorand',
				img: 'logos/algorand.png',
				id: 11,
			},
			{
				name: 'tether',
				img: 'logos/tether.png',
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
			arweave: null,
			leaderboard: [],
			start: false,
			addEntry: true,
			shiftBy: 1,
			playerName: '',
		};
		this.renderCards = this.renderCards.bind(this);
		this.checkCard = this.checkCard.bind(this);
		this.win = this.win.bind(this);
		this.reset = this.reset.bind(this);
		this.login = this.login.bind(this);
		this.submitScore = this.submitScore.bind(this);
		this.fetchScore = this.fetchScore.bind(this);
		this.firstGame = this.firstGame.bind(this);
		this.renderLeaderBoard = this.renderLeaderBoard.bind(this);
		this.enterPlayerName = this.enterPlayerName.bind(this);
	}
	async submitScore() {
		var unixTime = Math.round(new Date().getTime() / 1000);
		var tx = await this.state.arweave.createTransaction(
			{
				data: this.state.score.toString() + `&${this.state.playerName}`,
			},
			this.state.wallet,
		);
		console.log('TX', tx);
		tx.addTag('App-Name', 'arweave-crypto-cards');
		tx.addTag('App-Version', '0.0.1');
		tx.addTag('Unix-Time', unixTime);
		tx.addTag('Type', 'score');
		await this.state.arweave.transactions.sign(tx, this.state.wallet);
		let resp = await this.state.arweave.transactions.post(tx);
		console.log('Tx submission response', resp);
		alert('Submitting score');
	}
	async fetchScore(arweave) {
		let query = {
			op: 'and',
			expr1: {
				op: 'equals',
				expr1: 'App-Name',
				expr2: 'arweave-crypto-cards',
			},
			expr2: {
				op: 'equals',
				expr1: 'Type',
				expr2: 'score',
			},
		};
		const res = await arweave.arql(query);
		var tx_rows = [];
		if (res) {
			tx_rows = await Promise.all(
				res.map(async function (id, i) {
					let tx_row = {};
					let tx;
					try {
						tx = await arweave.transactions.get(id);
					} catch (error) {
						return {};
						// Here, `error` would be an `Error` (with stack trace, etc.).
						// Whereas if you used `throw 400`, it would just be `400`.
					}

					let tx_owner = await arweave.wallets.ownerToAddress(
						tx.owner,
					);

					// if (tx_owner != address) return;

					tx_row['unixTime'] = '0';
					tx_row['type'] = null;
					tx.get('tags').forEach((tag) => {
						let key = tag.get('name', {
							decode: true,
							string: true,
						});
						let value = tag.get('value', {
							decode: true,
							string: true,
						});
						if (key === 'Unix-Time')
							tx_row['unixTime'] = parseInt(value);
						if (key === 'Type') tx_row['type'] = value;
					});

					let data = tx.get('data', { decode: true, string: true });
					data = data.split('&');
					tx_row['id'] = id;
					tx_row['value'] = parseInt(data[0]);
					tx_row['player'] = tx_owner;
					tx_row['name'] = data[1];

					return tx_row;
				}),
			);
			tx_rows.sort((a, b) => {
				return b.value - a.value != 0
					? b.value - a.value
					: a.unixTime - b.unixTime;
			});
			this.setState({ leaderboard: tx_rows });
		}

		console.log('Rows', tx_rows);
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
				document.getElementsByClassName('matched').length ==
				this.state.shuffleCards.length
			) {
				this.win();
			}
		}
	}
	win() {
		this.setState({ pause: true, finished: true });
		// this.submitScore();
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
		this.fetchScore(arweave);
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
						_this.setState({ wallet, loggedIn: true, address });
					});
			} catch (err) {
				alert('Error logging in: ' + err);
			}
		};
		fr.readAsText(event.target.files[0]);
	}
	firstGame() {
		this.hideModal();
		this.setState({ start: true });
	}
	renderLeaderBoard() {
		let entries = [];
		let added = false;
		this.state.leaderboard.forEach((v) => {
			if (typeof v.unixTime == 'undefined') return;
			if (v.value < this.state.score && !added && this.state.start) {
				entries.push({
					value: this.state.score,
					id: this.state.address,
					name: this.state.playerName,
					highlight: true,
					player: this.state.address,
				});
				added = true;
			}
			entries.push(v);
		});
		if (!added && this.state.start) {
			entries.push({
				value: this.state.score,
				id: this.state.address,
				name: this.state.playerName,
				highlight: true,
				player: this.state.address,
			});
		}
		return (
			<table>
				<thead>
					<tr>
						<th>Rank </th>
						<th>Player Name </th>
						<th>Player ID </th>
						<th>Score</th>
					</tr>
				</thead>
				<tbody>
					{entries.map((obj, ind) => {
						return (
							<tr
								key={ind}
								className={obj.highlight ? 'highlight' : ''}
							>
								<td>{ind + 1}</td>
								<td>{obj.name}</td>
								<td>{obj.player}</td>
								<td className="blue">
									{!obj.highlight ? (
										<a
											href={getUrl(obj.id)}
											target="_blank"
										>
											{obj.value}
										</a>
									) : (
										<span>{obj.value}</span>
									)}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		);
	}
	enterPlayerName(event) {
		this.setState({ playerName: event.target.value });
	}
	render() {
		return (
			<div className="wrap">
				{this.renderCards()}
				<div className="modal-overlay">
					<div className="modal">
						<h2 className="label">AR Cards</h2>

						{this.state.finished ? (
							<h4 className="winner">You Rock!</h4>
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
							<div>
								{this.renderLeaderBoard()}
								{this.state.start ? (
									<div>
										<button
											className="restart"
											onClick={this.reset}
										>
											Play Again !!
										</button>
										<button
											className="restart"
											onClick={this.submitScore}
										>
											Submit Score
										</button>
									</div>
								) : (
									<div>
										<input
											type="text"
											className="forminput"
											id="name"
											placeholder="Enter your name"
											onChange={this.enterPlayerName}
										/>
										<button
											className="restart"
											onClick={this.firstGame}
										>
											Play Game
										</button>
									</div>
								)}
							</div>
						)}

						<p className="message">
							Developed on{' '}
							<a href="https://arweave.rog">ARweave</a> by{' '}
							<a href="https://github.com/elliotyagami">
								Harsh Jain
							</a>
						</p>
						{this.state.start ? (
							<div>
								<p className="share-text">Share it?</p>
								<ul className="social">
									<li>
										<a
											target="_blank"
											className="twitter"
											href={
												'https://twitter.com/share?url=I scored ' +
												this.state.score +
												' on ARweave cards build on https://arweave.org'
											}
										>
											<span className="fa fa-twitter"></span>
										</a>
									</li>
									<li>
										<a
											target="_blank"
											className="facebook"
											href={
												'https://www.facebook.com/sharer.php?u=I scored ' +
												this.state.score +
												' on ARweave cards build on https://arweave.org'
											}
										>
											<span className="fa fa-facebook"></span>
										</a>
									</li>
									<li>
										<a
											target="_blank"
											className="google"
											href={
												'https://plus.google.com/share?url=I scored ' +
												this.state.score +
												' on ARweave cards build on https://arweave.org'
											}
										>
											<span className="fa fa-google"></span>
										</a>
									</li>
								</ul>
							</div>
						) : (
							''
						)}
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
