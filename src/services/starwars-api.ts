const BASE_URL = "https://swapi.dev/api/people";

export async function getCharacters(searchTerm: string, page: number) {
    const query = searchTerm
        ? `?search=${encodeURIComponent(searchTerm)}&page=${page}`
        : `?page=${page}`;
    return fetch(`${BASE_URL}${query}`);
}
