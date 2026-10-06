import { router } from 'expo-router';
import { Search, Sparkles, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppScreen } from '@/components/AppScreen';
import { BottomNavigation } from '@/components/BottomNavigation';
import { ProfessionalCard } from '@/components/ProfessionalCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useCategories, useProfessionals, useSession } from '@/data/hooks';
import { useUiStore } from '@/state/uiStore';
import { colors, radii, spacing } from '@/theme';

export default function ClientHomeScreen() {
  const [search, setSearch] = useState('');
  const categoryId = useUiStore((state) => state.selectedCategoryId);
  const selectCategory = useUiStore((state) => state.selectCategory);
  const { data: user } = useSession();
  const categoryQuery = useCategories();
  const professionalsQuery = useProfessionals(categoryId, search);

  useEffect(() => {
    if (user && user.role !== 'client') router.replace('/professional/dashboard');
  }, [user]);

  return (
    <AppScreen footer={<BottomNavigation role="client" />} contentStyle={styles.content}>
      <ScreenHeader
        title="Encuentra tu momento"
        eyebrow={`Hola${user?.name ? `, ${user.name.split(' ')[0]}` : ''}`}
        logout
      />
      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={styles.heroEyebrow}>BIENESTAR CERCA DE TI</Text>
          <Text style={styles.heroTitle}>Un buen plan{'\n'}empieza contigo.</Text>
          <Text style={styles.heroSubtitle}>Personas expertas, tiempo para ti.</Text>
        </View>
        <View style={styles.sparkle}>
          <Sparkles size={23} color={colors.forestDeep} />
        </View>
        <View style={styles.heroStamp}>
          <Text style={styles.heroStampText}>hoy sí</Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Search size={18} color={colors.muted} />
        <TextInput
          accessibilityLabel="Buscar profesional o servicio"
          onChangeText={setSearch}
          placeholder="Profesional, servicio o zona"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
          testID="professional-search"
          value={search}
        />
        {search ? (
          <Pressable
            accessibilityLabel="Limpiar búsqueda"
            style={styles.clearSearch}
            accessibilityRole="button"
            onPress={() => setSearch('')}
            testID="search-clear"
          >
            <X size={17} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Explora por servicio</Text>
          <Text style={styles.sectionSubtitle}>¿Qué te gustaría hacer?</Text>
        </View>
      </View>
      <ScrollView
        horizontal
        contentContainerStyle={styles.categoryList}
        showsHorizontalScrollIndicator={false}
      >
        <CategoryChip
          id="all"
          label="Todo"
          icon="✳"
          selected={categoryId === null}
          onPress={() => selectCategory(null)}
        />
        {(categoryQuery.data ?? []).map((category) => (
          <CategoryChip
            key={category.id}
            id={category.id}
            label={category.name}
            icon={category.icon}
            selected={categoryId === category.id}
            onPress={() => selectCategory(category.id)}
          />
        ))}
      </ScrollView>

      <View style={styles.professionalHeading}>
        <Text style={styles.sectionTitle}>
          {search ? 'Resultados' : 'Profesionales destacados'}
        </Text>
        <Text style={styles.resultCount}>{professionalsQuery.data?.length ?? 0}</Text>
      </View>
      {professionalsQuery.isLoading ? (
        <Text style={styles.empty}>Cargando profesionales…</Text>
      ) : null}
      {professionalsQuery.isError ? (
        <Text style={styles.empty}>No pudimos cargar los perfiles. Inténtalo de nuevo.</Text>
      ) : null}
      {!professionalsQuery.isLoading && professionalsQuery.data?.length === 0 ? (
        <View style={styles.noResults}>
          <Text style={styles.noResultsTitle}>Todavía no encontramos coincidencias</Text>
          <Text style={styles.empty}>Prueba otra búsqueda o categoría.</Text>
        </View>
      ) : null}
      <View style={styles.list}>
        {(professionalsQuery.data ?? []).map((professional) => (
          <ProfessionalCard
            key={professional.id}
            onPress={() =>
              router.push({
                pathname: '/client/booking',
                params: { professionalId: professional.id },
              })
            }
            professional={professional}
          />
        ))}
      </View>
    </AppScreen>
  );
}

interface CategoryChipProps {
  id: string;
  label: string;
  icon: string;
  selected: boolean;
  onPress: () => void;
}

function CategoryChip({ id, label, icon, selected, onPress }: CategoryChipProps) {
  return (
    <Pressable
      accessibilityLabel={`Categoría: ${label}`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.categoryChip, selected && styles.categoryChipSelected]}
      testID={`category-${id}`}
    >
      <Text style={[styles.categoryIcon, selected && styles.categoryTextSelected]}>{icon}</Text>
      <Text style={[styles.categoryLabel, selected && styles.categoryTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  clearSearch: { minHeight: 48, minWidth: 48, justifyContent: 'center', alignItems: 'center' },
  content: { paddingTop: spacing.sm, paddingBottom: spacing.md, gap: spacing.md },
  hero: {
    minHeight: 166,
    borderRadius: radii.lg,
    backgroundColor: colors.forest,
    overflow: 'hidden',
    padding: spacing.lg,
    justifyContent: 'center',
  },
  heroCopy: { gap: spacing.xs, zIndex: 1 },
  heroEyebrow: { color: '#BFD9CE', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  heroTitle: {
    color: colors.surface,
    fontFamily: 'Georgia',
    fontSize: 27,
    lineHeight: 30,
    fontWeight: '700',
  },
  heroSubtitle: { color: '#E3EFE8', fontSize: 12 },
  sparkle: {
    position: 'absolute',
    right: 25,
    top: 25,
    width: 49,
    height: 49,
    borderRadius: 18,
    backgroundColor: colors.lemon,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '9deg' }],
  },
  heroStamp: {
    position: 'absolute',
    right: 23,
    bottom: 20,
    borderWidth: 1,
    borderColor: '#7DA396',
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    transform: [{ rotate: '-8deg' }],
  },
  heroStampText: { color: '#D7E9DF', fontSize: 11, fontWeight: '700' },
  searchBox: {
    minHeight: 50,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  searchInput: { flex: 1, color: colors.ink, fontSize: 14, minHeight: 48 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: '800' },
  sectionSubtitle: { color: colors.muted, fontSize: 12, marginTop: 2 },
  categoryList: { gap: spacing.sm, paddingVertical: 2 },
  categoryChip: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryChipSelected: { backgroundColor: colors.forest, borderColor: colors.forest },
  categoryIcon: { color: colors.coral, fontSize: 14, fontWeight: '800' },
  categoryLabel: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  categoryTextSelected: { color: colors.surface },
  professionalHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  resultCount: {
    color: colors.forest,
    backgroundColor: colors.mint,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
    borderRadius: radii.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  list: { gap: spacing.sm },
  empty: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  noResults: { paddingVertical: spacing.lg, gap: spacing.xs, alignItems: 'center' },
  noResultsTitle: { color: colors.ink, fontSize: 14, fontWeight: '700' },
});
