import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { guests, seatingType, date, time, name, surname, phone, email } =
      body;

    // Make sure nothing is missing
    if (
      !guests ||
      !seatingType ||
      !date ||
      !time ||
      !name ||
      !surname ||
      !phone ||
      !email
    ) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const { data, error } = await db
      .from('reservations')
      .insert({
        guests,
        seating_type: seatingType,
        date,
        time,
        name,
        surname,
        phone,
        email,
      })
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { data, error } = await db
    .from('reservations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}
