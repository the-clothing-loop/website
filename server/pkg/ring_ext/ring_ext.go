package ring_ext

import (
	"github.com/samber/lo"
	"golang.design/x/go2generics/ring"
)

func SomeNext[Val any](r *ring.Ring[Val], f func(Val) bool) *ring.Ring[Val] {
	return some(r, f, true)
}
func SomePrev[Val any](r *ring.Ring[Val], f func(Val) bool) *ring.Ring[Val] {
	return some(r, f, false)
}
func some[Val any](r *ring.Ring[Val], f func(Val) bool, isNext bool) *ring.Ring[Val] {
	var p *ring.Ring[Val]
	if isNext {
		p = r.Next()
	} else {
		p = r.Prev()
	}
	for {
		if f(p.Value) {
			break
		}
		if p == r {
			return nil
		}
		if isNext {
			p = p.Next()
		} else {
			p = p.Prev()
		}
	}
	return p
}

// return nil if needle is not found in ring
func Find[Val comparable](r *ring.Ring[Val], needle Val) *ring.Ring[Val] {
	return SomeNext(r, func(v Val) bool {
		return v == needle
	})
}

func Each[Val any](r *ring.Ring[Val], f func(*ring.Ring[Val])) {
	if r != nil {
		f(r)
		for p := r.Next(); p != r; p = p.Next() {
			f(p)
		}
	}
}

// Returns a ring that contains references to all the values from the given array.
// The returned ring is the first in the array
func NewWithValues[Val any](values []Val) *ring.Ring[Val] {
	lenV := len(values)
	r := ring.New[Val](lenV)

	p := r.Next()
	for i := 0; i < lenV; i++ {
		p.Value = values[i]
		p = p.Next()
	}

	return r.Next()
}

func GetSurroundingValues[Val comparable](r *ring.Ring[Val], me Val, distance int) []Val {
	meRing := Find(r, me)
	if meRing == nil {
		return nil
	}
	result := []Val{}
	i := 1
	SomeNext(meRing, func(val Val) bool {
		if i > distance || val == me {
			return true
		}
		result = append(result, val)

		i++
		return false
	})
	i = 1
	SomePrev(meRing, func(val Val) bool {
		if i > distance || val == me {
			return true
		}

		result = append([]Val{val}, result...)

		i++
		return false
	})
	result = lo.Uniq(result)
	return result
}
