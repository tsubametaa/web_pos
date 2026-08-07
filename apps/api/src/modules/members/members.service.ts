import { eq, and, like, or, desc } from 'drizzle-orm';
import { db, members, memberPrices, Member, MemberPrice } from '../../db';
import Fuse from 'fuse.js';

function normalizePhone(phone: string): string {
	return phone.replace(/[^0-9]/g, '').replace(/^0/, '62');
}

export class MembersService {
	async getMembers(searchQuery?: string) {
		const allMembers = await db.select().from(members).orderBy(desc(members.createdAt));
		const allPrices = await db.select({
			memberId: memberPrices.memberId,
			sku: memberPrices.sku,
			customPrice: memberPrices.customPrice
		}).from(memberPrices);

		const pricesMap = new Map<string, { sku: string; customPrice: number }[]>();
		for (const p of allPrices) {
			const list = pricesMap.get(p.memberId) || [];
			list.push({ sku: p.sku, customPrice: p.customPrice });
			pricesMap.set(p.memberId, list);
		}

		let matchedMembers = allMembers;

		if (searchQuery && searchQuery.trim()) {
			const cleanQuery = searchQuery.trim();
			const normQuery = cleanQuery.replace(/[^0-9]/g, '');

			const exactLike = allMembers.filter((m) => {
				const mPhoneClean = m.phone.replace(/[^0-9]/g, '');
				return (
					m.name.toLowerCase().includes(cleanQuery.toLowerCase()) ||
					m.phone.includes(cleanQuery) ||
					(normQuery.length >= 2 && mPhoneClean.includes(normQuery)) ||
					(m.email && m.email.toLowerCase().includes(cleanQuery.toLowerCase()))
				);
			});

			const fuse = new Fuse(allMembers, {
				keys: ['phone', 'name', 'email'],
				threshold: 0.5,
				ignoreLocation: true
			});
			const fuzzyResults = fuse.search(cleanQuery).map((r) => r.item);

			const map = new Map<string, typeof allMembers[0]>();
			for (const item of exactLike) {
				map.set(item.id, item);
			}
			for (const item of fuzzyResults) {
				if (!map.has(item.id)) {
					map.set(item.id, item);
				}
			}
			matchedMembers = Array.from(map.values());
		}

		return matchedMembers.map((m) => ({
			...m,
			prices: pricesMap.get(m.id) || []
		}));
	}

	async getMemberById(id: string) {
		const memberList = await db.select().from(members).where(eq(members.id, id)).limit(1);
		if (!memberList[0]) return null;

		const prices = await db.select().from(memberPrices).where(eq(memberPrices.memberId, id));
		return {
			...memberList[0],
			prices
		};
	}

	async getMemberByPhone(phone: string) {
		const cleanPhone = phone.trim();
		if (!cleanPhone) return null;

		const allMembers = await db.select().from(members);
		if (allMembers.length === 0) return null;

		// Try exact match first
		let matchedMember = allMembers.find((m) => m.phone.trim() === cleanPhone);

		// Try normalized exact match (e.g. 08123 vs 628123)
		if (!matchedMember) {
			const normInput = normalizePhone(cleanPhone);
			matchedMember = allMembers.find((m) => normalizePhone(m.phone) === normInput);
		}

		// Fallback to Fuse.js fuzzy search on phone and name ONLY for full phone numbers (length >= 10)
		if (!matchedMember && cleanPhone.replace(/[^0-9]/g, '').length >= 10) {
			const fuse = new Fuse(allMembers, {
				keys: ['phone', 'name'],
				threshold: 0.35,
				ignoreLocation: true
			});
			const results = fuse.search(cleanPhone);
			if (results.length > 0) {
				matchedMember = results[0].item;
			}
		}

		if (!matchedMember) return null;

		const prices = await db.select({
			sku: memberPrices.sku,
			customPrice: memberPrices.customPrice
		}).from(memberPrices).where(eq(memberPrices.memberId, matchedMember.id));

		return {
			id: matchedMember.id,
			name: matchedMember.name,
			phone: matchedMember.phone,
			email: matchedMember.email,
			address: matchedMember.address,
			notes: matchedMember.notes,
			isActive: Boolean(matchedMember.isActive),
			prices
		};
	}

	async createMember(data: { name: string; phone: string; email?: string; address?: string; notes?: string }) {
		const cleanPhone = data.phone.trim();
		const existing = await db.select().from(members).where(eq(members.phone, cleanPhone)).limit(1);
		if (existing.length > 0) {
			throw new Error(`Nomor telepon ${cleanPhone} sudah terdaftar sebagai member.`);
		}

		const result = await db.insert(members).values({
			name: data.name.trim(),
			phone: cleanPhone,
			email: data.email?.trim() || null,
			address: data.address?.trim() || null,
			notes: data.notes?.trim() || null,
			isActive: true,
			createdAt: new Date(),
			updatedAt: new Date()
		}).returning();

		return result[0];
	}

	async updateMember(id: string, data: { name?: string; phone?: string; email?: string; address?: string; notes?: string; isActive?: boolean }) {
		const existing = await this.getMemberById(id);
		if (!existing) {
			throw new Error('Member tidak ditemukan.');
		}

		if (data.phone && data.phone.trim() !== existing.phone) {
			const cleanPhone = data.phone.trim();
			const phoneCheck = await db.select().from(members).where(eq(members.phone, cleanPhone)).limit(1);
			if (phoneCheck.length > 0 && phoneCheck[0].id !== id) {
				throw new Error(`Nomor telepon ${cleanPhone} sudah digunakan oleh member lain.`);
			}
		}

		const updatePayload: Record<string, any> = {
			updatedAt: new Date()
		};

		if (data.name !== undefined) updatePayload.name = data.name.trim();
		if (data.phone !== undefined) updatePayload.phone = data.phone.trim();
		if (data.email !== undefined) updatePayload.email = data.email?.trim() || null;
		if (data.address !== undefined) updatePayload.address = data.address?.trim() || null;
		if (data.notes !== undefined) updatePayload.notes = data.notes?.trim() || null;
		if (data.isActive !== undefined) updatePayload.isActive = Boolean(data.isActive);

		const updated = await db.update(members)
			.set(updatePayload)
			.where(eq(members.id, id))
			.returning();

		return updated[0];
	}

	async deleteMember(id: string) {
		const existing = await this.getMemberById(id);
		if (!existing) {
			throw new Error('Member tidak ditemukan.');
		}

		await db.delete(members).where(eq(members.id, id));
		return { success: true };
	}

	async setMemberPrice(memberId: string, sku: string, customPrice: number) {
		const cleanSku = sku.trim().toUpperCase();
		if (customPrice <= 0) {
			throw new Error('Harga khusus member harus lebih dari 0.');
		}

		const existingPrice = await db.select().from(memberPrices)
			.where(and(eq(memberPrices.memberId, memberId), eq(memberPrices.sku, cleanSku)))
			.limit(1);

		if (existingPrice.length > 0) {
			const updated = await db.update(memberPrices)
				.set({ customPrice, updatedAt: new Date() })
				.where(eq(memberPrices.id, existingPrice[0].id))
				.returning();
			return updated[0];
		} else {
			const inserted = await db.insert(memberPrices).values({
				memberId,
				sku: cleanSku,
				customPrice,
				createdAt: new Date(),
				updatedAt: new Date()
			}).returning();
			return inserted[0];
		}
	}

	async deleteMemberPrice(memberId: string, sku: string) {
		const cleanSku = sku.trim().toUpperCase();
		await db.delete(memberPrices)
			.where(and(eq(memberPrices.memberId, memberId), eq(memberPrices.sku, cleanSku)));
		return { success: true };
	}
}
