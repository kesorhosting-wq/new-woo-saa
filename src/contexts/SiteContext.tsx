// Site context for global state management
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { handleApiError } from '@/lib/errorHandler';

export interface Game {
  id: string;
  name: string;
  slug?: string;
  image: string;
  coverImage?: string;
  packages: Package[];
  specialPackages: Package[];
  g2bulkCategoryId?: string;
  featured?: boolean;
}

export interface Package {
  id: string;
  name: string;
  amount: string;
  price: number;
  currency: string;
  icon?: string;
  label?: string;
  labelBgColor?: string;
  labelTextColor?: string;
  g2bulkProductId?: string;
  g2bulkTypeId?: string;
  quantity: number;
}

export interface SiteSettings {
  siteName: string;
  logoUrl: string;
  heroText: string;
  browserTitle: string;
  siteIcon: string;
  bannerImage: string;
  backgroundImage: string;
  footerText: string;
  footerFacebookUrl: string;
  footerTelegramUrl: string;
  footerTiktokUrl: string;
  footerPaymentIcons: string[];
  supportPhone: string;
  supportEmail: string;
}

interface SiteContextType {
  settings: SiteSettings;
  games: Game[];
  paymentMethods: any[];
  ikhodePayment: any;
  isLoading: boolean;
  refreshGames: () => Promise<void>;
  updateSettings: (settings: Partial<SiteSettings>) => Promise<void>;
  addGame: (game: any) => Promise<void>;
  updateGame: (id: string, game: any) => Promise<void>;
  deleteGame: (id: string) => Promise<void>;
  addPackage: (gameId: string, pkg: any) => Promise<void>;
  updatePackage: (gameId: string, packageId: string, pkg: any) => Promise<void>;
  deletePackage: (gameId: string, packageId: string) => Promise<void>;
  addSpecialPackage: (gameId: string, pkg: any) => Promise<void>;
  updateSpecialPackage: (gameId: string, packageId: string, pkg: any) => Promise<void>;
  deleteSpecialPackage: (gameId: string, packageId: string) => Promise<void>;
}

const defaultSettings: SiteSettings = {
  siteName: 'Woo Saa Topup',
  logoUrl: '',
  heroText: 'GET YOUR POWER LOAD',
  browserTitle: 'Woo Saa Topup - Game Topup Cambodia',
  siteIcon: '',
  bannerImage: '',
  backgroundImage: '',
  footerText: '',
  footerFacebookUrl: '',
  footerTelegramUrl: '',
  footerTiktokUrl: '',
  footerPaymentIcons: [],
  supportPhone: '+855 00 000 000',
  supportEmail: 'ops@woosaatopup.com',
};

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const SiteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [settingsResult, gamesResult, packagesResult, specialPackagesResult] = await Promise.all([
        supabase.from('site_settings').select('*'),
        supabase.from('games').select('*').order('sort_order', { ascending: true }),
        supabase.from('packages').select('*').order('sort_order', { ascending: true }),
        supabase.from('special_packages').select('*').order('sort_order', { ascending: true }),
      ]);
      
      if (settingsResult.data) {
        const loaded: any = {};
        settingsResult.data.forEach(r => loaded[r.key] = r.value);
        setSettings(prev => ({ ...prev, ...loaded }));
      }

      if (gamesResult.data) {
        const gs: Game[] = gamesResult.data.map(g => ({
          id: g.id, name: g.name, image: g.image, coverImage: g.cover_image,
          featured: g.featured, g2bulkCategoryId: g.g2bulk_category_id,
          packages: (packagesResult.data || []).filter(p => p.game_id === g.id).map(p => ({
            id: p.id, name: p.name, amount: p.amount, price: Number(p.price), quantity: p.quantity || 1,
            g2bulkProductId: p.g2bulk_product_id, g2bulkTypeId: p.g2bulk_type_id,
            label: p.label, labelBgColor: p.label_bg_color, labelTextColor: p.label_text_color
          })),
          specialPackages: (specialPackagesResult.data || []).filter(p => p.game_id === g.id).map(p => ({
            id: p.id, name: p.name, amount: p.amount, price: Number(p.price), quantity: p.quantity || 1,
            g2bulkProductId: p.g2bulk_product_id, g2bulkTypeId: p.g2bulk_type_id,
            label: p.label, labelBgColor: p.label_bg_color, labelTextColor: p.label_text_color
          }))
        }));
        setGames(gs);
      }
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    for (const [key, value] of Object.entries(newSettings)) {
      await supabase.from('site_settings').upsert({ key, value }, { onConflict: 'key' });
    }
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addGame = async (game: any) => {
    await supabase.from('games').insert({ name: game.name, image: game.image, g2bulk_category_id: game.g2bulkCategoryId, featured: game.featured, cover_image: game.coverImage });
    loadData();
  };

  const updateGame = async (id: string, game: any) => {
    await supabase.from('games').update({ name: game.name, image: game.image, g2bulk_category_id: game.g2bulkCategoryId, featured: game.featured, cover_image: game.coverImage }).eq('id', id);
    loadData();
  };

  const deleteGame = async (id: string) => {
    await supabase.from('games').delete().eq('id', id);
    loadData();
  };

  const addPackage = async (gameId: string, pkg: any) => {
    await supabase.from('packages').insert({
      game_id: gameId, name: pkg.name, amount: pkg.amount, price: pkg.price,
      quantity: pkg.quantity || 1, g2bulk_product_id: pkg.g2bulkProductId, g2bulk_type_id: pkg.g2bulkTypeId,
      label: pkg.label, label_bg_color: pkg.labelBgColor, label_text_color: pkg.labelTextColor
    });
    loadData();
  };

  const updatePackage = async (gameId: string, packageId: string, pkg: any) => {
    await supabase.from('packages').update({
      name: pkg.name, amount: pkg.amount, price: pkg.price,
      quantity: pkg.quantity || 1, g2bulk_product_id: pkg.g2bulkProductId, g2bulk_type_id: pkg.g2bulkTypeId,
      label: pkg.label, label_bg_color: pkg.labelBgColor, label_text_color: pkg.labelTextColor
    }).eq('id', packageId);
    loadData();
  };

  const deletePackage = async (gameId: string, packageId: string) => {
    await supabase.from('packages').delete().eq('id', packageId);
    loadData();
  };

  const addSpecialPackage = async (gameId: string, pkg: any) => {
    await supabase.from('special_packages').insert({
      game_id: gameId, name: pkg.name, amount: pkg.amount, price: pkg.price,
      quantity: pkg.quantity || 1, g2bulk_product_id: pkg.g2bulkProductId, g2bulk_type_id: pkg.g2bulkTypeId,
      label: pkg.label, label_bg_color: pkg.labelBgColor, label_text_color: pkg.labelTextColor
    });
    loadData();
  };

  const updateSpecialPackage = async (gameId: string, packageId: string, pkg: any) => {
    await supabase.from('special_packages').update({
      name: pkg.name, amount: pkg.amount, price: pkg.price,
      quantity: pkg.quantity || 1, g2bulk_product_id: pkg.g2bulkProductId, g2bulk_type_id: pkg.g2bulkTypeId,
      label: pkg.label, label_bg_color: pkg.labelBgColor, label_text_color: pkg.labelTextColor
    }).eq('id', packageId);
    loadData();
  };

  const deleteSpecialPackage = async (gameId: string, packageId: string) => {
    await supabase.from('special_packages').delete().eq('id', packageId);
    loadData();
  };

  return (
    <SiteContext.Provider value={{
      settings, games, paymentMethods: [], ikhodePayment: null, isLoading,
      refreshGames: async () => { loadData(); }, updateSettings, addGame, updateGame, deleteGame,
      addPackage, updatePackage, deletePackage,
      addSpecialPackage, updateSpecialPackage, deleteSpecialPackage,
      movePackage: async () => { loadData(); }
    }}>
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => {
  const context = useContext(SiteContext);
  if (!context) throw new Error('useSite must be used within SiteProvider');
  return context;
};
