import './App.css';

import React, { Component } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { getCharacters } from './services/starwars-api.ts';

interface SearchProps {
  onSearch: (searchTerm: string) => void;
}

interface SearchState {
  searchTerm: string;
}

class Search extends Component<SearchProps, SearchState> {
  constructor(props: SearchProps) {
    super(props);
    this.state = { searchTerm: localStorage.getItem('searchTerm') || '' };
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchTerm: event.target.value });
  };

  handleSearch = () => {
    const trimmedTerm = this.state.searchTerm.trim();
    localStorage.setItem('searchTerm', trimmedTerm);
    this.props.onSearch(trimmedTerm);
  };

  render() {
    return (
      <div>
        <input
          type="text"
          className="search-input"
          value={this.state.searchTerm}
          onChange={this.handleChange}
          placeholder="Search Star Wars characters..."
        />
        <button onClick={this.handleSearch}>Search</button>
        <button
          onClick={() => {
            throw new Error('Test Error');
          }}
        >
          Throw Error
        </button>
      </div>
    );
  }
}

interface SearchResultsProps {
  loading: boolean;
  error: string | null;
  results: { name: string; birth_year: string }[];
}

class SearchResults extends Component<SearchResultsProps> {
  render() {
    const { loading, error, results } = this.props;

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (results.length === 0) return <p>No results found.</p>;

    return (
      <ul className="character-list">
        <li>
          <h3>Character name</h3>
          <p>Birth year</p>
        </li>
        {results.map((item, index) => (
          <li key={index}>
            <h3>{item.name}</h3>
            <p>{item.birth_year}</p>
          </li>
        ))}
      </ul>
    );
  }
}

interface AppState {
  results: { name: string; birth_year: string }[];
  loading: boolean;
  error: string | null;
  page: number;
  searchTerm: string;
}

export default class App extends Component<unknown, AppState> {
  constructor(props: unknown) {
    super(props);
    this.state = {
      results: [],
      loading: false,
      error: null,
      page: 1,
      searchTerm: '',
    };
  }

  fetchResults = (searchTerm: string = '', page: number = 1) => {
    if (page === 5) {
      throw new Error('Simulated error on page 5');
    }

    this.setState({ loading: true, error: null, searchTerm });

    getCharacters(searchTerm.trim(), page)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => this.setState({ results: data.results, loading: false, page }))
      .catch((error) => this.setState({ error: error.message, loading: false }));
  };

  handlePageChange = (newPage: number) => {
    this.fetchResults(this.state.searchTerm, newPage);
  };

  componentDidMount() {
    const savedTerm = localStorage.getItem('searchTerm') || '';
    this.fetchResults(savedTerm);
  }

  render() {
    return (
      <ErrorBoundary>
        <div>
          <Search onSearch={(term) => this.fetchResults(term, 1)} />
          <SearchResults {...this.state} />
          <div>
            <button disabled={this.state.page === 1} onClick={() => this.handlePageChange(this.state.page - 1)}>
              Previous
            </button>
            <span> Page {this.state.page} </span>
            <button onClick={() => this.handlePageChange(this.state.page + 1)}>Next</button>
          </div>
        </div>
      </ErrorBoundary>
    );
  }
}
