import React from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
	constructor() {
		super();
		this.state = {
			cards: '',
		};
	}
	render() {
		return (
			<div class="modal-overlay">
				<div class="modal">
					<h2 class="winner">You Rock!</h2>
					<button class="restart">Play Again?</button>
					<p class="message">
						Developed on{' '}
						<a href="https://www.arweave.org/">Arweave</a> by{' '}
						<a href="https://github.com/elliotyagami">Harsh Jain</a>
					</p>
					<p class="share-text">Share it?</p>
					<ul class="social">
						<li>
							<a
								target="_blank"
								class="twitter"
								href="https://twitter.com/share?url=https://arweave.orgs"
							>
								<span class="fa fa-twitter"></span>
							</a>
						</li>
						<li>
							<a
								target="_blank"
								class="facebook"
								href="https://www.facebook.com/sharer.php?u=https://arweave.orgs"
							>
								<span class="fa fa-facebook"></span>
							</a>
						</li>
						<li>
							<a
								target="_blank"
								class="google"
								href="https://plus.google.com/share?url=https://arweave.orgs"
							>
								<span class="fa fa-google"></span>
							</a>
						</li>
					</ul>
				</div>
			</div>
		);
	}
}

export default App;
