// ============================================================
// GERENCIAMENTO DE TOKENS
// ============================================================
const tokenStorage = {
  salvar(data) {
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
  },
  getAccess() {
    return localStorage.getItem('access_token');
  },
};

// ============================================================
// SERVIÇO DE API
// ============================================================

async function apiRequest(method, path, body, query_params) {
  let append = '';
  if (query_params !== undefined) {
    append = '?' + new URLSearchParams(query_params).toString();
  }
  let headers = {
    'Authorization': `Bearer ${tokenStorage.getAccess()}`
  };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  let requestOptions = {
    method: method,
    headers: headers,
  }
  if (body !== undefined) {
    requestOptions.body = body;
  }
  const res = await fetch(`${API_BASE}${path}${append}`, requestOptions);
  const data = await res.json(req);
  lidarComErro(res, data);
  return data;
}

async function lidarComErro(res, data) {
  if (!res.ok) {
    let erro = 'Erro desconhecido';
    if (data.error) {
      erro = data.error;
    } else if (data.errors) {
      erro = '';
      for (let e of data.errors) {
        erro += e;
        erro += ';';
      }
    }
    const err = new Error(erro);
    err.status = res.status;
    err.code = erro;
    throw err;
  }
}

async function apiPost(path, body) {
  return apiRequest('POST', path, body, undefined);
}

async function apiPatch(path, body) {
  return apiRequest('PATCH', path, body, undefined);
}

async function apiGet(path, query_params) {
  return apiRequest('GET', path, undefined, query_params);
}

async function apiDelete(path, query_params) {
  return apiRequest('DELETE', path, undefined, query_params);
}

// ============================================================
// UTILITÁRIOS DE UI
// ============================================================
function mostrarErro(id, mensagem) {
  const el = document.getElementById(id);
  if (el) el.textContent = mensagem;
}

function limparErro(id) {
  const el = document.getElementById(id);
  if (el) el.textContent = '';
}
