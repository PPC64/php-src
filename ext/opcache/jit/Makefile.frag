
uname_arch := $(shell uname -m)

# PPC JIT only for 64 bits little endian
ifeq ($(uname_arch),ppc64le)
	uname_arch := ppc64le
else ifeq ($(uname_arch),$(filter $(uname_arch),x86_64 i386 i686 amd64))
	uname_arch := x86
else 
$(error This architecture does not support JIT)
endif

$(builddir)/minilua: $(srcdir)/jit/dynasm/minilua.c
	$(CC) $(srcdir)/jit/dynasm/minilua.c -lm -o $@

$(builddir)/jit/zend_jit_$(uname_arch).c: $(srcdir)/jit/zend_jit_$(uname_arch).dasc $(srcdir)/jit/dynasm/*.lua $(builddir)/minilua 
	$(builddir)/minilua $(srcdir)/jit/dynasm/dynasm.lua  $(DASM_FLAGS) -o $@ $(srcdir)/jit/zend_jit_$(uname_arch).dasc

$(builddir)/jit/zend_jit.lo: \
	$(builddir)/jit/zend_jit_$(uname_arch).c \
	$(srcdir)/jit/zend_jit_helpers.c \
	$(srcdir)/jit/zend_jit_disasm_$(uname_arch).c \
	$(srcdir)/jit/zend_jit_gdb.c \
	$(srcdir)/jit/zend_jit_perf_dump.c \
	$(srcdir)/jit/zend_jit_oprofile.c \
	$(srcdir)/jit/zend_jit_vtune.c \
	$(srcdir)/jit/zend_elf.c

