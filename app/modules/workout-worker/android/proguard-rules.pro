# The DTOs generated into com.limajuice.liftlog are (de)serialized reflectively
# by Moshi's KotlinJsonAdapterFactory and PolymorphicJsonAdapterFactory, which
# read their constructors, fields and Kotlin metadata at runtime. R8 has no way
# to see those usages, so keep the classes intact.
-keepattributes Signature,InnerClasses,EnclosingMethod
-keepattributes RuntimeVisibleAnnotations,RuntimeVisibleParameterAnnotations,AnnotationDefault
-keep class kotlin.Metadata { *; }
-keep class com.limajuice.liftlog.** { *; }
