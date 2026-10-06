import { ArrowUpRight, MapPin, Star } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Professional } from '@/types';
import { colors, radii, spacing } from '@/theme';

interface ProfessionalCardProps {
  professional: Professional;
  onPress: () => void;
}

export function ProfessionalCard({ professional, onPress }: ProfessionalCardProps) {
  return (
    <Pressable
      accessibilityLabel={`Reservar con ${professional.businessName}, ${professional.categoryName}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      testID={`professional-card-${professional.id}`}
    >
      <View style={styles.top}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>
            {professional.name
              .split(' ')
              .map((part) => part[0])
              .slice(0, 2)
              .join('')}
          </Text>
        </View>
        <View style={styles.business}>
          <Text style={styles.category}>{professional.categoryName}</Text>
          <Text numberOfLines={1} style={styles.name}>
            {professional.businessName}
          </Text>
          <Text numberOfLines={1} style={styles.professional}>
            {professional.name}
          </Text>
        </View>
        <View style={styles.arrow}>
          <ArrowUpRight size={17} color={colors.forest} />
        </View>
      </View>
      <Text numberOfLines={2} style={styles.bio}>
        {professional.bio}
      </Text>
      <View style={styles.bottom}>
        <View style={styles.meta}>
          <MapPin size={14} color={colors.muted} />
          <Text style={styles.metaText}>{professional.area}</Text>
        </View>
        <View style={styles.meta}>
          <Star size={14} color="#D59C2C" fill="#D59C2C" />
          <Text style={styles.rating}>{professional.rating.toFixed(1)}</Text>
          <Text style={styles.reviewCount}>({professional.reviewCount})</Text>
        </View>
      </View>
      {professional.serviceNames ? (
        <Text numberOfLines={1} style={styles.services}>
          {professional.serviceNames}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    gap: spacing.md,
  },
  pressed: { transform: [{ scale: 0.99 }], opacity: 0.9 },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.coralPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { color: colors.coral, fontSize: 16, fontWeight: '800' },
  business: { flex: 1, gap: 2 },
  category: { color: colors.forest, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  name: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  professional: { color: colors.muted, fontSize: 12 },
  arrow: {
    width: 31,
    height: 31,
    borderRadius: 11,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bio: { color: colors.ink, fontSize: 13, lineHeight: 18 },
  bottom: { flexDirection: 'row', justifyContent: 'space-between' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: colors.muted, fontSize: 11 },
  rating: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  reviewCount: { color: colors.muted, fontSize: 11 },
  services: {
    color: colors.muted,
    fontSize: 11,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: spacing.sm,
  },
});
