

// Change this URL for local development
const API_BASE_URL = 'https://portal-alumni.uol.edu.pk/api/external';
// Production: 'https://portal-alumni.uol.edu.pk/api/external'

class APIClient {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `API request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Events APIs
  async getHomePastEvents(limit = 4) {
    return this.request(`/events/home-past?limit=${limit}`);
  }

  async getHomeUpcomingEvents(limit = 4) {
    return this.request(`/events/home-upcoming?limit=${limit}`);
  }

  async getHomeCoachingEvents(limit = 3) {
    return this.request(`/events/home-coaching?limit=${limit}`);
  }

  async getEvents(filters = {}) {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString();
    return this.request(`/events${queryString ? '?' + queryString : ''}`);
  }

  async getEventById(id) {
    return this.request(`/events/${id}`);
  }

  async getChapterEvents(chapterId, limit = 3) {
    return this.request(`/events/chapter/${chapterId}?limit=${limit}`);
  }

  // Chapters APIs
  async getChapters(filters = {}) {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString();
    return this.request(`/chapters${queryString ? '?' + queryString : ''}`);
  }

  async getChapterById(id) {
    return this.request(`/chapters/${id}`);
  }

  async getChapterMembers(id, options = {}) {
    const params = new URLSearchParams();
    Object.keys(options).forEach(key => {
      if (options[key] !== null && options[key] !== undefined && options[key] !== '') {
        params.append(key, options[key]);
      }
    });
    const queryString = params.toString();
    return this.request(`/chapters/${id}/members${queryString ? '?' + queryString : ''}`);
  }

  async getChapterMemberCount(id) {
    return this.request(`/chapters/${id}/member-count`);
  }

  async getChapterMemberCounts(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return { data: {} };
    }
    const idsParam = ids.join(',');
    return this.request(`/chapters/member-counts?ids=${idsParam}`);
  }

  // Alumni APIs
  async getAlumniCount(associationId = null) {
    const params = associationId ? `?associationId=${associationId}` : '';
    return this.request(`/alumni/count${params}`);
  }

  async getAssociationMemberCounts(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return { data: {} };
    }
    const idsParam = ids.join(',');
    return this.request(`/alumni/association-counts?ids=${idsParam}`);
  }

  async getAssociationAlumni(associationId, options = {}) {
    const params = new URLSearchParams();
    Object.keys(options).forEach(key => {
      if (options[key] !== null && options[key] !== undefined && options[key] !== '') {
        params.append(key, options[key]);
      }
    });
    const queryString = params.toString();
    return this.request(`/alumni/association/${associationId}${queryString ? '?' + queryString : ''}`);
  }

  // Distinguished Alumni APIs
  async getDistinguishedAlumni(options = {}) {
    const params = new URLSearchParams();
    Object.keys(options).forEach(key => {
      if (options[key] !== null && options[key] !== undefined && options[key] !== '') {
        params.append(key, options[key]);
      }
    });
    const queryString = params.toString();
    return this.request(`/distinguished-alumni${queryString ? '?' + queryString : ''}`);
  }

  async getDistinguishedAlumniBySlug(slug) {
    return this.request(`/distinguished-alumni/${slug}`);
  }

  // Associations APIs
  async getAssociations() {
    return this.request('/associations');
  }

  async getAssociationById(id) {
    return this.request(`/associations/${id}`);
  }
}

// Export singleton instance
const apiClient = new APIClient();
window.apiClient = apiClient; // Make available globally

