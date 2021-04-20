import axios from "axios"
import * as $ from 'jquery';

"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $episodesList = $("#episodesList");
const $searchForm = $("#searchForm");
const ROOT = "http://api.tvmaze.com/";
http://api.tvmaze.com/shows/SHOW-ID-HERE/episodes.
const MISSING_IMAGE_URL = "https://tinyurl.com/missing-tv";

type Show = {
  id: number,
  name: string,
  summary: string,
  image: {
    medium: string
  }
}

type Episode = {
  id: number,
  name: string,
  season: number,
  number: number
}


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string): Promise<Show[]> {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const result = await axios.get(`${ROOT}search/shows?q=${term}`);
  const shows = result.data.map((r: { show : Show }) => ({
    id: r.show.id,
    name: r.show.name,
    summary: r.show.summary,
    image: r.show.image?.medium || MISSING_IMAGE_URL
  }));
  return shows
  
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: Show[]) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val() as string;
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id: number): Promise<Episode[]> { 
  const resp = await axios.get(`${ROOT}shows/${id}/episodes`)
  const episodes = resp.data.map((e: Episode ) => (
    e
  ));
  return episodes
}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes: Episode[]) {
  $episodesList.empty();
  $episodesArea.toggle();

  for (let episode of episodes) {
    const $episode = $(
        `
       <li>${episode.name} (season ${episode.season}, number ${episode.number})</li>
      `);

    $episodesList.append($episode);  }
}

$("#showsList").on("click", ".Show-getEpisodes", async function (evt) {
  const id = $(evt.target).closest(".Show").data("show-id")
  const episodes = await getEpisodesOfShow(id);
  populateEpisodes(episodes)
})