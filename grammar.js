module.exports = grammar({
  name: 'xml',

  extras: $ => [
  //   $.comment,
  //   /[\s\uFEFF\u2060\u200B\u00A0]/
  ],


  conflicts: $ => [
  
    [$.source_file],
    [$.prolog],
    [$.element],
    [$.source_file, $.prolog],
    [$.Sep1],
    [$.Sep2],
    [$.EmptyElemTag],
  ],

  rules: {
    source_file: $ => seq(
      repeat($._Misc),
      optional($.prolog),
      repeat($._Misc),
      $.element,
      repeat($._Misc)
    ),

    // _Char: $ => /\u9|\uA|\uD|[\u20-\uD7FF]|[\uE000-\uFFFD]|[\u10000-\u10FFFF]/,

    _Char: $ => /./,

    // _S: $ => /(\x20|\x9|\xD|\xA)+/,

    _S: $ => /[\s]|\r?\n/,

    // _NameStartChar: $ => /: | [A-Z] | _ | [a-z] | [\xC0-\xD6] | [\xD8-\xF6] | [\uF8-\u2FF] | [\u370-\u37D] | [\u37F-\u1FFF] | [\u200C-\u200D] | [\u2070-\u218F] | [\u2C00-\u2FEF] | [\u3001-\uD7FF] | [\uF900-\uFDCF] | [\uFDF0-\uFFFD] | [\u10000-\uEFFFF]/,
    //
    // _NameChar: $ => choice(
    //   $._NameStartChar,
    //   '-',
    //   '.',
    //   /[0-9]/,
    //   '\xB7',
    //   /[\u0300-\u036F]/,
    //   /[\u203F-\u2040]/
    // ),
    //
    // Name: $ => seq(
    //   $._NameStartChar,
    //   repeat($._NameChar)
    // ),

    Name: $ => token(/[A-Za-z_]([A-Za-z0-9_\-.:])*/),

    Names: $ => seq(
      $.Name,
      repeat(
        seq(
          '\x20',
          $.Name
        )
      )
    ),

    // Nmtoken: $ => repeat1(
    //   $._NameChar
    // ),
    //
    // _Nmtoken: $ => repeat1(
    //   choice(
      //   /: | [A-Z] | _ | [a-z] | [\xC0-\xD6] | [\xD8-\xF6] | [\uF8-\u2FF] | [\u370-\u37D] | [\u37F-\u1FFF] | [\u200C-\u200D] | [\u2070-\u218F] | [\u2C00-\u2FEF] | [\u3001-\uD7FF] | [\uF900-\uFDCF] | [\uFDF0-\uFFFD] | [\u10000-\uEFFFF]/,
      //   '-',
      //   '.',
      //   /[0-9]/,
      //   '\xB7',
      //   /[\u0300-\u036F]/,
      //   /[\u203F-\u2040]/
      // )
    // ),

    Nmtoken: $ => token(repeat1(/[A-Z_a-z\-.0-9]/)),

    Nmtokens: $ => seq(
      $.Nmtoken,
      repeat(
        seq(
          '\x20',
          $.Nmtoken
        )
      )
    ),

    EntityValue: $ => seq(
      '"',
      repeat(
        choice(
          $.Sep3,
          $.PEReference,
          $._Reference
        )
      ),
      '"'
    ),

    AttValue: $ => choice(
      seq(
        '"',
        repeat(
          choice(
            $.Sep1,
            $._Reference
          )
        ),
        '"'
      ),
      seq(
        '\'',
        repeat(
          choice(
            $.Sep2,
            $._Reference
          )
        ),
        '\''
      )
    ),

    Sep1: $ => prec.right(repeat1(/[^<&"]/)),
    Sep2: $ => prec.right(repeat1(/[^<&']/)),
    Sep3: $ => prec.right(repeat1(/[^%&"]/)),

    SystemLiteral: $ => token(/("[^"]*")|('[^']*')/),

    // PubidLiteral: $ => choice(
    //   seq(
    //     '"',
    //     repeat($._PubidChar),
    //     '"'
    //   ),
    //   seq(
    //     '\'',
    //     repeat($._PubidChar),
    //     '\''
    //   )
    // ),

    PubidLiteral: $ => token(/("(\x20|\x0D|\x0A|[a-zA-Z0-9]|[\-'()+,./:=?;!*#@$_%])*")|('(\x20|\x0D|\x0A|[a-zA-Z0-9]|[\-'()+,./:=?;!*#@$_%])*')/),

    // _PubidChar: $ => /\x20 | \x0D | \x0A | [a-zA-Z0-9] | [-'()+,./:=?;!*#@$_%]/,

    CharData: $ => token(/[^\s\n\r<&][^<&]*/),

    Text: $ => repeat1(
      choice(
        $._S,
        $._Char
      )
    ),
    
    // Comment: $ => seq(
    //   '<!--',
    //   optional(
    //     $.Text,
    //   ),
    //   '-->'
    // ),

    Comment: $ => token(choice(
      seq(
        '<!--',
        /([^-]|-[^-])*/,
        '-->'
      )
    )),

    PI: $ => seq(
      '<?',
      $._PITarget,
      optional(
        $.Text
      ),
      '?>'
    ),

    _PITarget: $ => $.Name,

    // CDSect: $ => seq(
    //   $.CDStart,
    //   optional($.CData),
    //   $.CDEnd
    // ),

    CDSect: $ => token(prec(3,
      seq(
        '<![CDATA',
        /[^\]]*\]+([^>\]][^\]]*\]+)*/,
        '>'
      )
    )),

    // CDStart: $ => '<![CDATA',

    // // CData: $ => repeat1($._Char),
    // CData: $ => repeat1(token(/[^\]]([^\]][^>])*/)),

    // comment: $ => token(prec(PREC.COMMENT, choice(
    //   seq('//', /.*/),
    //   seq(
    //     '/*',
    //     /[^*]*\*+([^/*][^*]*\*+)*/,
    //     '/'
    //   )
    // ))),

    // CDEnd: $ => ']]>',

    prolog: $ => choice(
      // seq(
      //   optional($.XMLDecl),
      //   repeat($._Misc),
      //   optional(
      //     seq(
      //       $.doctypedecl,
      //       // repeat($._Misc)
      //     )
      //   )
      // ),
      seq(
        $.XMLDecl,
        optional(seq(
          repeat($._Misc), // TODO check if it might break compression
          $.doctypedecl,
        )),
      ),
      seq(
        optional($.XMLDecl),
        repeat($._Misc),
        $.doctypedecl,
      ),
    ),

    XMLDecl: $ => seq(
      '<?xml',
      $.VersionInfo,
      optional($.EncodingDecl),
      optional($.SDDecl),
      optional($._S),
      '?>'
    ),

    VersionInfo: $ => seq(
      $._S,
      'version',
      $._Eq,
      choice(
        seq(
          '\'',
          $.VersionNum,
          '\''
        ),
        seq(
          '"',
          $.VersionNum,
          '"'
        )
      )
    ),

    _Eq: $ => seq(
      optional($._S),
      '=',
      optional($._S)
    ),

    VersionNum: $ => /1\.[0-9]+/,

    _Misc: $ => choice(
      $.Comment,
      $.PI,
      $._S
    ),

    doctypedecl: $ => seq(
      '<!DOCTYPE',
      $._S,
      $.Name,
      optional(
        seq(
          $._S,
          $.ExternalID
        )
      ),
      optional($._S),
      optional(
        seq(
          '[',
          optional($._intSubset),
          ']',
          optional($._S)
        )
      ),
      '>'
    ),

    _DeclSep: $ => choice(
      $.PEReference,
      $._S
    ),

    _intSubset: $ => repeat1(
      choice(
        $._markupdecl,
        $._DeclSep
      )
    ),

    _markupdecl: $ => choice(
      $.elementdecl,
      $.AttlistDecl,
      $._EntityDecl,
      $.NotationDecl,
      $.PI,
      $.Comment
    ),

    _extSubset: $ => seq(
      optional($.TextDecl),
      optional($._extSubsetDecl)
    ),

    _extSubsetDecl: $ => repeat1(
      choice(
        $._markupdecl,
        $._conditionalSect,
        $._DeclSep
      )
    ),

    SDDecl: $ => seq(
      $._S,
      'standalone',
      $._Eq,
      choice(
        seq(
          '\'',
          choice(
            'yes',
            'no'
          ),
          '\''
        ),
        seq(
          '"',
          choice(
            'yes',
            'no'
          ),
          '"'
        )
      )
    ),
    
    element: $ => choice(
      $.EmptyElemTag,
      seq(
        $.STag,
        repeat($._S),
        optional($.CharData),
        repeat($._S),
        optional($._content),
        $.ETag
      )
    ),

    _SS: $ => prec.right(10, $._S),

    STag: $ => seq(
      '<',
      $.Name,
      repeat(
        seq(
          repeat1($._S),
          $.Attribute
        )
      ),
      repeat($._S),
      '>'
    ),

    Attribute: $ => seq(
      $.Name,
      $._Eq,
      $.AttValue
    ),

    ETag: $ => seq(
      '</',
      $.Name,
      optional($._S),
      '>'
    ),

    _content: $ => repeat1(
      // seq(
        choice(
          $.element,
          $._Reference,
          $.CDSect,
          $.PI,
          $.Comment,
          prec.right(repeat1($._S)),
          $.CharData,
        ),
        // choice(repeat($._S),$.CharData)
      //  optional(alias('CharData',$._AAA))
      // )
    ),

    EmptyElemTag: $ => seq(
      '<',
      $.Name,
      repeat(
        seq(
          repeat1($._S),
          $.Attribute
        )
      ),
      optional($._S),
      '/>'
    ),

    elementdecl: $ => seq(
      '<!ELEMENT',
      $._S,
      $.Name,
      $._S,
      $.contentspec,
      optional($._S),
      '>'
    ),

    contentspec: $ => choice(
      'EMPTY',
      'ANY',
      $.Mixed,
      $.children
    ),

    children: $ => seq(
      choice(
        $._choice,
        $._seq
      ),
      optional(
        choice(
          '?',
          '*',
          '+'
        )
      )
    ),

    _cp: $ => seq(
      choice(
        $.Name,
        $._choice,
        $._seq
      ),
      optional(
        choice(
          '?',
          '*',
          '+'
        )
      )
    ),

    _choice: $ => seq(
      '(',
      optional($._S),
      $._cp,
      repeat1(
        seq(
          optional($._S),
          '|',
          optional($._S),
          $._cp
        )
      ),
      optional($._S),
      ')'
    ),

    _seq: $ => seq(
      '(',
      optional($._S),
      $._cp,
      repeat(
        seq(
          optional($._S),
          ',',
          optional($._S),
          $._cp
        )
      ),
      optional($._S),
      ')'
    ),

    Mixed: $ => choice(
      seq(
        '(',
        optional($._S),
        '#PCDATA',
        repeat(
          seq(
            optional($._S),
            '|',
            optional($._S),
            $.Name
          )
        ),
        optional($._S),
        ')*'
      ),
      seq(
        '(',
        optional($._S),
        '#PCDATA',
        optional($._S),
        ')'
      )
    ),

    AttlistDecl: $ => seq(
      '<!ATTLIST',
      $._S,
      $.Name,
      repeat($._AttDef),
      optional($._S),
      '>'
    ),

    _AttDef: $ => seq(
      $._S,
      $.Name,
      $._S,
      $._AttType,
      $._S,
      $.DefaultDecl
    ),

    _AttType: $ => choice(
      $.StringType,
      $.TokenizedType,
      $._EnumeratedType
    ),

    StringType: $ => 'CDATA',

    TokenizedType: $ => choice(
      'ID',
      'IDREF',
      'IDREFS',
      'ENTITY',
      'ENTITIES',
      'NMTOKEN',
      'NMTOKENS'
    ),

    _EnumeratedType: $ => choice(
      $.NotationType,
      $.Enumeration
    ),

    NotationType: $ => seq(
      'NOTATION',
      $._S,
      '(',
      optional($._S),
      $.Name,
      repeat(
        seq(
          optional($._S),
          '|',
          optional($._S),
          $.Name
        )
      ),
      optional($._S),
      ')'
    ),

    Enumeration: $ => seq(
      '(',
      optional($._S),
      $.Nmtoken,
      repeat(
        seq(
          optional($._S),
          '|',
          optional($._S),
          $.Nmtoken
        )
      ),
      optional($._S),
      ')'
    ),

    DefaultDecl: $ => choice(
      '#REQUIRED',
      '#IMPLIED',
      seq(
        optional(
          seq(
            '#FIXED',
            $._S
          )
        ),
        $.AttValue
      )
    ),

    _conditionalSect: $ => choice(
      $.includeSect,
      $.ignoreSect
    ),

    includeSect: $ => seq(
      '<![',
      optional($._S),
      'INCLUDE',
      optional($._S),
      '[',
      optional($._extSubsetDecl),
      ']]>'
    ),

    ignoreSect: $ => seq(
      '<![',
      optional($._S),
      'IGNORE',
      optional($._S),
      '[',
      repeat($.ignoreSectContents),
      ']]>'
    ),

    ignoreSectContents: $ => seq(
      optional($.Ignore),
      repeat1(
        seq(
          '<![',
          $.ignoreSectContents,
          ']]>',
          optional($.Ignore)
        )
      )
    ),

    Ignore: $ => repeat1($._Char),

    CharRef: $ => token(/(&#[0-9]+;)|(&#x[0-9a-fA-F]+;)/),

    _Reference: $ => choice(
      $.EntityRef,
      $.CharRef
    ),

    EntityRef: $ => seq(
      '&',
      $.Name,
      ';'
    ),

    PEReference: $ => seq(
      '%',
      $.Name,
      ';'
    ),

    _EntityDecl: $ => choice(
      $.GEDecl,
      $.PEDecl
    ),

    GEDecl: $ => seq(
      '<!ENTITY',
      $._S,
      $.Name,
      $._S,
      $._EntityDef,
      optional($._S),
      '>'
    ),

    PEDecl: $ => seq(
      '<!ENTITY',
      $._S,
      '%',
      $._S,
      $.Name,
      $._S,
      $._PEDef,
      optional($._S),
      '>'
    ),

    _EntityDef: $ => prec.left(
      choice(
        $.EntityValue,
        seq(
          $.ExternalID,
          optional($.NDataDecl)
        )
      )
    ),

    _PEDef: $ => choice(
      $.EntityValue,
      $.ExternalID
    ),

    ExternalID: $ => choice(
      seq(
        'SYSTEM',
        $._S,
        $.SystemLiteral
      ),
      seq(
        'PUBLIC',
        $._S,
        $.PubidLiteral,
        $._S,
        $.SystemLiteral
      )
    ),

    NDataDecl: $ => seq(
      $._S,
      'NDATA',
      $._S,
      $.Name
    ),

    TextDecl: $ => seq(
      '<?xml',
      optional($.VersionInfo),
      $.EncodingDecl,
      optional($._S),
      '?>'
    ),

    _extParsedEnt: $ => seq(
      optional($.TextDecl),
      optional($.CharData),
      optional($._content)
    ),

    EncodingDecl: $ => seq(
      $._S,
      'encoding',
      $._Eq,
      choice(
        seq(
          '"',
          $.EncName,
          '"'
        ),
        seq(
          '\'',
          $.EncName,
          '\''
        )
      )
    ),

    EncName: $ => token(/[A-Za-z]([A-Za-z0-9._\-])*/),

    NotationDecl: $ => seq(
      '<!NOTATION',
      $._S,
      $.Name,
      $._S,
      choice(
        $.ExternalID,
        $.PublicID
      ),
      optional($._S),
      '>'
    ),

    PublicID: $ => prec.left(
      seq(
        'PUBLIC',
        $._S,
        $.PubidLiteral
      )
    )
  }
});
