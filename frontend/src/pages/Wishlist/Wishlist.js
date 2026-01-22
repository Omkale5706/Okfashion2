import React, { useMemo, useState } from 'react';
import { FaThLarge, FaList, FaFilter, FaTrash, FaShareAlt, FaHeart } from 'react-icons/fa';
import Footer from '../../components/Footer/Footer';
import './Wishlist.css';

const Wishlist = () => {
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('grid');

  const items = useMemo(
    () => [
      {
        id: 1,
        type: 'outfit',
        title: 'Casual Chic Ensemble',
        subtitle: 'Everyday Essentials',
        image: 'https://images.unsplash.com/photo-1495121605193-b116b5b09a4c?auto=format&fit=crop&w=900&q=80',
        items: ['High-waisted jeans', 'Silk blouse', 'Blazer'],
        colors: ['Navy', 'Cream', 'Camel'],
        price: null,
      },
      {
        id: 2,
        type: 'item',
        title: 'Emerald Silk Blouse',
        subtitle: 'Elegant Essentials',
        image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
        items: ['Silk blend', 'Relaxed fit', 'Statement cuffs'],
        colors: ['Emerald', 'Ivory'],
        price: 89,
        date: '12/01/2026'
      },
      {
        id: 3,
        type: 'outfit',
        title: 'Weekend Comfort',
        subtitle: 'Relaxed Layers',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
        items: ['Midi dress', 'Denim jacket', 'White sneakers'],
        colors: ['Sage green', 'Light denim', 'White'],
        price: null,
      },
      {
        id: 4,
        type: 'accessory',
        title: 'Minimal Gold Set',
        subtitle: 'Accessories',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
        items: ['Stacked rings', 'Pendant chain'],
        colors: ['Gold'],
        price: 59,
        date: '08/01/2026'
      }
    ],
    []
  );

  const filteredItems = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((item) => item.type === filter);
  }, [filter, items]);

  return (
    <>
      <div className="wishlist-page">
        <div className="wishlist-container">
          <div className="wishlist-header">
            <div>
              <h1>My Wishlist</h1>
              <p>{filteredItems.length} items saved</p>
            </div>

            <div className="wishlist-controls">
              <div className="filter-box">
                <FaFilter />
                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                  <option value="all">All Items</option>
                  <option value="outfit">Outfits</option>
                  <option value="item">Items</option>
                  <option value="accessory">Accessories</option>
                </select>
              </div>

              <div className="view-toggle">
                <button
                  className={view === 'grid' ? 'active' : ''}
                  onClick={() => setView('grid')}
                  aria-label="Grid view"
                >
                  <FaThLarge />
                </button>
                <button
                  className={view === 'list' ? 'active' : ''}
                  onClick={() => setView('list')}
                  aria-label="List view"
                >
                  <FaList />
                </button>
              </div>
            </div>
          </div>

          <div className={`wishlist-grid ${view}`}>
            {filteredItems.map((item) => (
              <div key={item.id} className="wishlist-card">
                <div className="wishlist-image">
                  <img src={item.image} alt={item.title} />
                  <span className={`wishlist-tag ${item.type}`}>{item.type}</span>
                  <div className="wishlist-actions">
                    <button aria-label="Share">
                      <FaShareAlt />
                    </button>
                    <button aria-label="Remove">
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="wishlist-content">
                  <div>
                    <h3>{item.title}</h3>
                    <p className="wishlist-subtitle">{item.subtitle}</p>
                  </div>

                  <div className="wishlist-meta">
                    {item.price ? (
                      <p className="wishlist-price">${item.price}</p>
                    ) : (
                      <p className="wishlist-price">Curated</p>
                    )}
                    {item.date && (
                      <span className="wishlist-date">{item.date}</span>
                    )}
                  </div>

                  <div className="wishlist-section">
                    <h4>Items</h4>
                    <ul>
                      {item.items.map((value, index) => (
                        <li key={index}>{value}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="wishlist-section">
                    <h4>Colors</h4>
                    <div className="color-tags">
                      {item.colors.map((color, index) => (
                        <span key={index}>{color}</span>
                      ))}
                    </div>
                  </div>

                  <button className="wishlist-button">
                    <FaHeart /> Shop Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Wishlist;
