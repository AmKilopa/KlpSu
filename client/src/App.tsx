import { useState } from 'react';
import axios from 'axios';

const API_URL = '';

function App() {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isExisting, setIsExisting] = useState(false);

  const handleShorten = async () => {
    if (!longUrl) {
      setError('Введите URL');
      return;
    }

    setLoading(true);
    setError('');
    setIsExisting(false);
    
    try {
      const response = await axios.post(`${API_URL}/api/shorten`, { longUrl });
      setShortUrl(response.data.shortUrl);
      setIsExisting(response.data.existing);
    } catch (err) {
      setError('Ошибка при сокращении');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    alert('Скопировано!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">⚡ KlpSu</h1>
        <p className="text-center text-gray-600 mb-8">Shorten your links in one click</p>

        <div className="space-y-4">
          <input
            type="url"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            placeholder="Вставьте длинную ссылку"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />

          <button
            onClick={handleShorten}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? 'Сокращаем...' : 'Сократить'}
          </button>

          {error && <p className="text-red-500 text-center">{error}</p>}

          {shortUrl && (
            <div className={`${isExisting ? 'bg-yellow-50 border-yellow-300' : 'bg-green-50 border-green-300'} border-2 rounded-lg p-4`}>
              {isExisting && (
                <p className="text-sm text-yellow-700 mb-2">✓ Эта ссылка уже существует</p>
              )}
              <p className="text-sm text-gray-600 mb-2">Короткая ссылка:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shortUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white border rounded"
                />
                <button
                  onClick={copyToClipboard}
                  className={`${isExisting ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white px-4 py-2 rounded transition`}
                >
                  Копировать
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
