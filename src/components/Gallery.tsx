import React, { useCallback, useEffect, useRef, useState } from 'react';
import Masonry from 'react-masonry-css';
import './Gallery.css';
import { Angel } from '../types';
import AngelModal from './AngelModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import EditAngelForm from './EditAngelForm';
import { Filters } from './Sidebar';
import { getToken } from '../utils/auth';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface GalleryProps {
    filters: Filters;
    setFilters: (filters: Filters) => void;
    setTotalElements: (value: number) => void;
    triggerSidebarReload: () => void;
}

function Gallery({ filters, setFilters, setTotalElements, triggerSidebarReload }: GalleryProps) {
    const { t } = useTranslation();

    const [angels, setAngels] = useState<Angel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAngel, setSelectedAngel] = useState<Angel | null>(null);
    const [angelToDelete, setAngelToDelete] = useState<Angel | null>(null);
    const [angelToEdit, setAngelToEdit] = useState<Angel | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);

    const isFetchingRef = useRef(false);
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    const navigate = useNavigate();
    const location = useLocation();
    const { angelId } = useParams();
    const previousLocationRef = useRef<string | null>(null);

    const fetchAngels = useCallback((pageToLoad: number, reset = false) => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;

        const params = new URLSearchParams();
        if (filters.color) params.append('color', filters.color);
        if (filters.type) params.append('type', filters.type);
        if (filters.material) params.append('material', filters.material);
        if (filters.minHeight) params.append('minHeight', String(filters.minHeight));
        if (filters.maxHeight) params.append('maxHeight', String(filters.maxHeight));
        if (filters.sort) params.append('sort', filters.sort)
        params.append('page', String(pageToLoad));
        params.append('size', '12');

        fetch(`${process.env.REACT_APP_API_URL}/api/angels?${params.toString()}`)
            .then(res => {
                if (!res.ok) throw new Error(t('gallery.fetchError'));
                return res.json();
            })
            .then(data => {
                setAngels(prev => reset ? data.content : [...prev, ...data.content]);
                setHasMore(!data.last);
                setPage(pageToLoad + 1);
                setTotalElements(data.totalElements);
            })
            .catch(err => setError(err.message))
            .finally(() => {
                setLoading(false);
                isFetchingRef.current = false;
            });
    }, [filters, setTotalElements, t]);

    const filtersKey = JSON.stringify(filters);
    useEffect(() => {
        setAngels([]);
        setPage(0);
        setHasMore(true);
        fetchAngels(0, true);
    }, [filtersKey, fetchAngels]);

    useEffect(() => {
        if (!hasMore || loading) return;

        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                fetchAngels(page);
            }
        });

        if (sentinelRef.current) {
            observer.observe(sentinelRef.current);
        }

        return () => observer.disconnect();
    }, [page, hasMore, loading, fetchAngels]);

    useEffect(() => {
        if (angelId) {
            fetch(`${process.env.REACT_APP_API_URL}/api/angels/${angelId}`)
                .then(res => {
                    if (!res.ok) throw new Error(t('gallery.notFound'));
                    return res.json();
                })
                .then(data => setSelectedAngel(data))
                .catch(err => {
                    alert(err.message);
                    navigate('/angels');
                });
        }
    }, [angelId, navigate, t]);

    const handleDelete = (angelId: number) => {
        fetch(`${process.env.REACT_APP_API_URL}/api/angels/${angelId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${getToken()!}` },
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok) throw new Error(t('gallery.deleteError'));
                setAngelToDelete(null);
                setSelectedAngel(null);
                setAngels(prev => prev.filter(p => p.id !== angelId));
                navigate(previousLocationRef.current || '/angels');
                fetchAngels(0, true);
                triggerSidebarReload();
            })
            .catch(err => alert(err.message));
    };

    const handlePrev = () => {
        if (!selectedAngel) return;
        const index = angels.findIndex(p => p.id === selectedAngel.id);
        if (index > 0) {
            const prevAngel = angels[index - 1];
            setSelectedAngel(prevAngel);
            navigate(`/angels/${prevAngel.id}`);
        }
    };

    const handleNext = () => {
        if (!selectedAngel) return;
        const index = angels.findIndex(p => p.id === selectedAngel.id);
        const nextIndex = index + 1;

        if (nextIndex < angels.length) {
            const nextAngel = angels[nextIndex];
            setSelectedAngel(nextAngel);
            navigate(`/angels/${nextAngel.id}`);
        } else if (hasMore) {
            fetchAngels(page);
            const checkNextAngel = setInterval(() => {
                if (angels.length > nextIndex) {
                    const nextAngel = angels[nextIndex];
                    setSelectedAngel(nextAngel);
                    navigate(`/angels/${nextAngel.id}`);
                    clearInterval(checkNextAngel);
                }
            }, 100);
        }
    };

    const breakpointColumnsObj = {
        default: 4,
        1024: 3,
        600: 2
    };

    const currentIndex = selectedAngel ? angels.findIndex(p => p.id === selectedAngel.id) : -1;
    const canGoPrev = currentIndex > 0;
    const canGoNext = currentIndex < angels.length - 1 || hasMore;

    if (loading && angels.length === 0) return <p>{t('gallery.loading')}</p>;
    if (error) return <p>{t('gallery.error', { error })}</p>;

    return (
        <>
            <Masonry
                breakpointCols={breakpointColumnsObj}
                className="gallery"
                columnClassName="gallery-column"
            >
                {angels.map(angel => (
                    <div
                        className="angel"
                        key={angel.id}
                        onClick={() => {
                            if (!previousLocationRef.current) {
                                previousLocationRef.current = location.pathname + location.search;
                            }
                            navigate(`/angels/${angel.id}`);
                        }}
                    >
                        <img
                            src={`${process.env.REACT_APP_API_URL}/api/angels/${angel.id}/photos/${angel.thumbnail}/scaled`}
                            alt={t('gallery.alt', { id: angel.id })}
                            loading="lazy"
                        />
                    </div>
                ))}
            </Masonry>

            {hasMore && <div ref={sentinelRef} style={{ height: '1px' }} />}

            {selectedAngel && (
                <AngelModal
                    angel={selectedAngel}
                    onClose={() => {
                        setSelectedAngel(null);
                        navigate(previousLocationRef.current || '/angels');
                        setTimeout(() => {
                            previousLocationRef.current = null;
                        }, 0);
                    }}
                    onDelete={() => setAngelToDelete(selectedAngel)}
                    onEdit={() => setAngelToEdit(selectedAngel)}
                    isEditing={!!angelToEdit || !!angelToDelete}
                    onPrev={canGoPrev ? handlePrev : undefined}
                    onNext={canGoNext ? handleNext : undefined}
                />
            )}

            {angelToDelete && (
                <DeleteConfirmModal
                    onCancel={() => setAngelToDelete(null)}
                    onConfirm={() => handleDelete(angelToDelete.id)}
                />
            )}

            {angelToEdit && (
                <EditAngelForm
                    angel={angelToEdit}
                    onClose={() => setAngelToEdit(null)}
                    onSave={() => {
                        fetch(`${process.env.REACT_APP_API_URL}/api/angels/${angelToEdit.id}`)
                            .then(res => res.json())
                            .then(updated => {
                                setSelectedAngel(updated);
                                triggerSidebarReload();
                            });
                    }}
                />
            )}
        </>
    );
}

export default Gallery;
